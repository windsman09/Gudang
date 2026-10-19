from pymodbus.client import ModbusTcpClient
from fastapi import HTTPException

# Struktur baru: 1 Kelas = 2 Perangkat (Relay ETD8A12 & Sensor ESP32)
# 1. PERBAIKAN DICTIONARY (Tambahkan koma di setiap akhir kelas)
ROOM_DEVICES = {
    "kelas-1": {
        "relay": {"host": "10.21.240.3", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1} 
    }, 
    "kelas-2": {
        "relay": {"host": "10.21.240.2", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1}
    },
    "kelas-3": {
        "relay": {"host": "10.21.240.4", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1}
    },
    "kelas-4": {
        "relay": {"host": "10.21.240.5", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1}
    },
    "kelas-5": {
        "relay": {"host": "10.21.240.7", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1}
    },
    "kelas-6": {
        "relay": {"host": "10.21.240.1", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1}
    }
}

# Konstanta untuk ETD8A12
OUTPUT_ON = 0x100  # 256
OUTPUT_OFF = 0x200 # 512
NUM_RELAYS = 12
RELAY_START_ADDRESS = 0

def get_room_config(device_id: str):
    if device_id not in ROOM_DEVICES:
        raise HTTPException(status_code=404, detail=f"Ruangan {device_id} tidak terdaftar")
    return ROOM_DEVICES[device_id]

def read_all_relays(device_id: str):
    """Membaca status relay dari modul ETD8A12 (dengan sistem fallback)"""
    config = get_room_config(device_id)["relay"]
    client = ModbusTcpClient(config["host"], port=config["port"])
    
    # Menyiapkan data default jika alat offline (12 channel mati)
    default_channels = [{"channel": i + 1, "is_on": False, "raw_value": 0} for i in range(NUM_RELAYS)]
    
    try:
        if not client.connect():
            # Jangan lemparkan HTTPException, kembalikan nilai default agar frontend tetap jalan
            return default_channels
            
        response = client.read_holding_registers(RELAY_START_ADDRESS, count=NUM_RELAYS)

        
        if response.isError():
            return default_channels
            
        channels = []
        for i, value in enumerate(response.registers):
            channels.append({
                "channel": i + 1,
                "is_on": value != 0,
                "raw_value": value
            })
        return channels
        
    except Exception:
        # Menangkap error jaringan (seperti No route to host) dan mem-bypassnya
        return default_channels
    finally:
        client.close()
def write_relay(device_id: str, index: int, state: bool):
    """Mengontrol relay pada modul ETD8A12"""
    if index < 0 or index >= NUM_RELAYS:
        raise HTTPException(status_code=400, detail="Index channel tidak valid (harus 0-11)")
        
    config = get_room_config(device_id)["relay"]
    client = ModbusTcpClient(config["host"], port=config["port"])
    
    try:
        if not client.connect():
            raise HTTPException(status_code=503, detail="Gagal terhubung ke modul Relay ETD8A12")
            
        address = RELAY_START_ADDRESS + index
        value = OUTPUT_ON if state else OUTPUT_OFF
        
        response = client.write_register(address, value)
        if response.isError():
            raise HTTPException(status_code=500, detail=f"Gagal menulis ke channel {index + 1}")
            
        return {"message": "Write OK", "address": address, "value": value, "state": state}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        print(f"\n---> DETAIL ERROR WRITE RELAY: {str(e)} <---\n")
    finally:
        client.close()

def read_all_sensors(device_id: str):
    """Membaca data sensor dari ESP32"""
    config = get_room_config(device_id)["sensor"]
    
    # Jika ESP32 belum dipasang, kita bisa mem-bypass agar Frontend tidak error
    if config["host"] == "":
        return {"temperature": 0, "light_level": 0, "status": "ESP32 belum terpasang"}

    client = ModbusTcpClient(config["host"], port=config["port"])
    
    try:
        if not client.connect():
             # Tidak melempar error agar halaman monitoring tetap bisa menampilkan relay
            return {"temperature": 0, "light_level": 0, "error": "ESP32 Offline"}
            
        # Asumsi ESP32 Anda memprogram pembacaan sensor dari alamat 0
        SENSOR_START_ADDRESS = 0 
        NUM_SENSORS = 2
        
        response = client.read_holding_registers(SENSOR_START_ADDRESS, count=NUM_SENSORS)
        
        if response.isError():
            return {"temperature": 0, "light_level": 0, "error": "Gagal membaca sensor ESP32"}
            
        return {
            "temperature": response.registers[0] / 10.0,
            "light_level": response.registers[1]
        }
    except Exception as e:
        return {"temperature": 0, "light_level": 0, "error": str(e)}
    finally:
        client.close()

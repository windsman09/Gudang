from pymodbus.client import ModbusTcpClient
from fastapi import HTTPException

ROOM_DEVICES = {
    "kelas-1": {
        "relay": {"host": "10.21.240.3", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1},
    },
    "kelas-2": {
        "relay": {"host": "10.21.240.2", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1},
    },
    "kelas-3": {
        "relay": {"host": "10.21.240.4", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1},
    },
    "kelas-4": {
        "relay": {"host": "10.21.240.5", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1},
    },
    "kelas-5": {
        "relay": {"host": "10.21.240.7", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1},
    },
    "kelas-6": {
        "relay": {"host": "10.21.240.1", "port": 5000, "unit_id": 1},
        "sensor": {"host": "10.21.240.1", "port": 502, "unit_id": 1},
    },
}

OUTPUT_ON = 0x100
OUTPUT_OFF = 0x200
NUM_RELAYS = 12
RELAY_START_ADDRESS = 0


def get_room_config(device_id: str):
    if device_id not in ROOM_DEVICES:
        raise HTTPException(status_code=404, detail="Ruangan tidak terdaftar")
    return ROOM_DEVICES[device_id]


def read_all_relays(device_id: str):
    config = get_room_config(device_id)["relay"]
    client = ModbusTcpClient(config["host"], port=config["port"])
    default_channels = [
        {"channel": i + 1, "is_on": False, "raw_value": None}
        for i in range(NUM_RELAYS)
    ]

    try:
        if not client.connect():
            return default_channels
        response = client.read_holding_registers(
            RELAY_START_ADDRESS, count=NUM_RELAYS
        )
        if response.isError():
            return default_channels

        channels = []
        for i, value in enumerate(response.registers):
            if value == OUTPUT_ON:
                is_on = True
            elif value == OUTPUT_OFF:
                is_on = False
            else:
                # Unknown register values must not be reported as ON.
                is_on = False
            channels.append({
                "channel": i + 1,
                "is_on": is_on,
                "raw_value": value,
            })
        return channels
    except Exception:
        return default_channels
    finally:
        client.close()


def write_relay(device_id: str, index: int, state: bool):
    if index < 0 or index >= NUM_RELAYS:
        raise HTTPException(
            status_code=400,
            detail="Index channel tidak valid (harus 0-11)"
        )

    config = get_room_config(device_id)["relay"]
    client = ModbusTcpClient(config["host"], port=config["port"])

    try:
        if not client.connect():
            raise HTTPException(
                status_code=503,
                detail="Gagal terhubung ke modul Relay ETD8A12"
            )

        address = RELAY_START_ADDRESS + index
        value = OUTPUT_ON if state else OUTPUT_OFF
        response = client.write_register(address, value)
        if response.isError():
            raise HTTPException(
                status_code=502,
                detail="Gagal menulis ke modul relay"
            )

        return {
            "message": "Write OK",
            "address": address,
            "value": value,
            "state": state,
        }
    except HTTPException:
        raise
    except Exception:
        # Keep network/device details in server logs, not API responses.
        raise HTTPException(
            status_code=502,
            detail="Terjadi kesalahan saat mengakses modul relay"
        )
    finally:
        client.close()


def read_all_sensors(device_id: str):
    config = get_room_config(device_id)["sensor"]
    if not config["host"]:
        return {
            "temperature": 0,
            "light_level": 0,
            "status": "ESP32 belum terpasang",
        }

    client = ModbusTcpClient(config["host"], port=config["port"])
    try:
        if not client.connect():
            return {
                "temperature": 0,
                "light_level": 0,
                "error": "ESP32 Offline",
            }

        response = client.read_holding_registers(0, count=2)
        if response.isError():
            return {
                "temperature": 0,
                "light_level": 0,
                "error": "Gagal membaca sensor ESP32",
            }

        return {
            "temperature": response.registers[0] / 10.0,
            "light_level": response.registers[1],
        }
    except Exception:
        return {
            "temperature": 0,
            "light_level": 0,
            "error": "Gagal mengakses sensor ESP32",
        }
    finally:
        client.close()


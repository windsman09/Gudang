from fastapi import APIRouter
from pydantic import BaseModel
# Kita akan menambahkan fungsi baru untuk membaca sensor dari service
from app.services.modbus_service import read_all_relays, read_all_sensors, write_relay

router = APIRouter(prefix="/api/modbus", tags=["Modbus"])

class SwitchRequest(BaseModel):
    state: bool

# 1. Endpoint khusus untuk membaca status saklar/relay (Lampu, AC, dll)
@router.get("/{device_id}/relays")
def get_relays(device_id: str):
    data = read_all_relays(device_id) # Sebelumnya bernama read_all_channels
    return {"status": "success", "device_id": device_id, "data": data}

# 2. Endpoint khusus untuk membaca nilai sensor (Suhu, Cahaya, dll)
@router.get("/{device_id}/sensors")
def get_sensors(device_id: str):
    data = read_all_sensors(device_id)
    return {"status": "success", "device_id": device_id, "data": data}

# 3. Endpoint GABUNGAN (Sangat disarankan untuk Frontend)
# Agar React tidak perlu melakukan 2x request (fetch), gunakan endpoint ini untuk mengambil semua data kelas sekaligus.
@router.get("/{device_id}/status")
def get_device_status(device_id: str):
    relays = read_all_relays(device_id)
    sensors = read_all_sensors(device_id)
    return {
        "status": "success", 
        "device_id": device_id, 
        "data": {
            "relays": relays,
            "sensors": sensors
        }
    }

# 4. Endpoint untuk menyalakan/mematikan alat (sebelumnya bernama channel)
@router.post("/{device_id}/relay/{index}")
def set_relay(device_id: str, index: int, request: SwitchRequest):
    result = write_relay(device_id, index, request.state) # Sebelumnya bernama write_channel
    return {"status": "success", "data": result}

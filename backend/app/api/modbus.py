from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.modbus_service import read_all_relays, read_all_sensors, write_relay

from app.core.dependencies import get_current_user
from app.core.permissions import require_operator

router = APIRouter(prefix="/api/modbus", tags=["Modbus"])

class SwitchRequest(BaseModel):
    state: bool


# =========================================================
# BAGIAN READ-ONLY (BISA DIAKSES OLEH SEMUA ROLE)
# =========================================================

# 1. Endpoint khusus untuk membaca status saklar/relay
@router.get("/{device_id}/relays")
def get_relays(
    device_id: str,
    current_user: dict = Depends(get_current_user)  # <-- Semua role (termasuk 'user') bisa akses
):
    data = read_all_relays(device_id)
    return {"status": "success", "device_id": device_id, "data": data}

# 2. Endpoint khusus untuk membaca nilai sensor
@router.get("/{device_id}/sensors")
def get_sensors(
    device_id: str,
    current_user: dict = Depends(get_current_user)  # <-- Semua role (termasuk 'user') bisa akses
):
    data = read_all_sensors(device_id)
    return {"status": "success", "device_id": device_id, "data": data}

# 3. Endpoint GABUNGAN (Sangat disarankan untuk Frontend)
@router.get("/{device_id}/status")
def get_device_status(
    device_id: str,
    current_user: dict = Depends(get_current_user)  # <-- Semua role (termasuk 'user') bisa akses
):
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


# =========================================================
# BAGIAN KONTROL (HANYA OPERATOR, ADMIN, DAN SUPERUSER)
# =========================================================

# 4. Endpoint untuk menyalakan/mematikan alat
@router.post("/{device_id}/relay/{index}")
def set_relay(
    device_id: str, 
    index: int, 
    request: SwitchRequest,
    current_user: dict = Depends(require_operator)  # <-- Role 'user' akan ditolak (Error 403)
):
    result = write_relay(device_id, index, request.state)
    return {"status": "success", "data": result}

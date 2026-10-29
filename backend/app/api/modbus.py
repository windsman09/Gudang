from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.modbus_service import read_all_relays, read_all_sensors, write_relay
from app.core.permissions import require_operator
from app.core.permissions import require_roles

router = APIRouter(prefix="/api/modbus", tags=["Modbus"])

class SwitchRequest(BaseModel):
    state: bool


# =========================================================
# BAGIAN READ-ONLY (PUBLIK - TANPA PERLU LOGIN)
# =========================================================

@router.get("/{device_id}/relays")
def get_relays(device_id: str):
    data = read_all_relays(device_id)
    return {"status": "success", "device_id": device_id, "data": data}

@router.get("/{device_id}/sensors")
def get_sensors(device_id: str):
    data = read_all_sensors(device_id)
    return {"status": "success", "device_id": device_id, "data": data}

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


# =========================================================
# BAGIAN KONTROL (HANYA OPERATOR, ADMIN, DAN SUPERUSER)
# =========================================================

@router.post("/{device_id}/relay/{index}")
def set_relay(
    device_id: str, 
    index: int, 
    request: SwitchRequest,
    current_user: dict = Depends(require_operator)# <-- Tetap wajib login sebagai Operator/Admin/Superuser
):
    result = write_relay(device_id, index, request.state)
    return {"status": "success", "data": result}

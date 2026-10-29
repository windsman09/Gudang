from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pymodbus.client import ModbusTcpClient

from app.core.dependencies import get_current_user
from app.core.permissions import require_operator

router = APIRouter(
    prefix="/device",
    tags=["Device Control"]
)

MODBUS_HOST = "10.21.240.5"
MODBUS_PORT = 5000
MODBUS_SLAVE_ID = 1

ETD8A12_OUTPUT_ON = 0x100
ETD8A12_OUTPUT_OFF = 0x200


class ChannelState(BaseModel):
    status: bool


def get_modbus_client():
    return ModbusTcpClient(MODBUS_HOST, port=MODBUS_PORT)


@router.get("/channels")
def get_all_channels(current_user: dict = Depends(get_current_user)):
    client = get_modbus_client()
    if not client.connect():
        client.close()
        raise HTTPException(
            status_code=503,
            detail="Gagal terhubung ke perangkat Modbus"
        )

    try:
        result = client.read_holding_registers(address=0, count=12)
        if result.isError():
            raise HTTPException(status_code=502, detail="Error membaca register")

        channels = [
            {
                "channel_id": i,
                "status": val == ETD8A12_OUTPUT_ON
            }
            for i, val in enumerate(result.registers)
        ]
        return {"channels": channels}
    finally:
        client.close()


@router.post("/channels/{channel_id}")
def set_channel_status(
    channel_id: int,
    payload: ChannelState,
    current_user: dict = Depends(require_operator),
):
    if channel_id < 0 or channel_id > 11:
        raise HTTPException(status_code=400, detail="Channel ID tidak valid")

    client = get_modbus_client()
    if not client.connect():
        client.close()
        raise HTTPException(
            status_code=503,
            detail="Gagal terhubung ke perangkat Modbus"
        )

    try:
        value_to_write = (
            ETD8A12_OUTPUT_ON if payload.status else ETD8A12_OUTPUT_OFF
        )
        result = client.write_register(address=channel_id, value=value_to_write)
        if result.isError():
            raise HTTPException(
                status_code=502,
                detail=f"Gagal mengubah channel {channel_id}"
            )
        return {"channel_id": channel_id, "status": payload.status}
    finally:
        client.close()


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pymodbus.client import ModbusTcpClient

# Menggunakan APIRouter, bukan FastAPI()
router = APIRouter(
    prefix="/device",
    tags=["Device Control"]
)

# Konfigurasi Perangkat
MODBUS_HOST = "10.21.240.5"
MODBUS_PORT = 5000
MODBUS_SLAVE_ID = 1

ETD8A12_OUTPUT_ON = 0x100
ETD8A12_OUTPUT_OFF = 0x200

# Anda juga bisa memindahkan ini ke app/schemas.py jika ingin lebih rapi
class ChannelState(BaseModel):
    status: bool

def get_modbus_client():
    return ModbusTcpClient(MODBUS_HOST, port=MODBUS_PORT)

@router.get("/channels")
def get_all_channels():
    client = get_modbus_client()
    if not client.connect():
        raise HTTPException(status_code=503, detail="Gagal terhubung ke perangkat Modbus")
    
    try:
        result = client.read_holding_registers(address=0, count=12)
        if result.isError():
            raise HTTPException(status_code=500, detail="Error membaca register")
        
        channels = []
        for i, val in enumerate(result.registers):
            channels.append({
                "channel_id": i,
                "status": True if val == ETD8A12_OUTPUT_ON else False
            })
        return {"channels": channels}
    finally:
        client.close()

@router.post("/channels/{channel_id}")
def set_channel_status(channel_id: int, payload: ChannelState):
    if channel_id < 0 or channel_id > 11:
        raise HTTPException(status_code=400, detail="Channel ID tidak valid")
        
    client = get_modbus_client()
    if not client.connect():
        raise HTTPException(status_code=503, detail="Gagal terhubung ke perangkat Modbus")
        
    try:
        value_to_write = ETD8A12_OUTPUT_ON if payload.status else ETD8A12_OUTPUT_OFF
        result = client.write_register(address=channel_id, value=value_to_write)
        if result.isError():
            raise HTTPException(status_code=500, detail=f"Gagal mengubah channel {channel_id}")
            
        return {"channel_id": channel_id, "status": payload.status}
    finally:
        client.close()

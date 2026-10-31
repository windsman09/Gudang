import hmac
import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.sensor_reading import SensorReading


router = APIRouter(prefix="/api/sensors", tags=["Room Sensors"])
ALLOWED_DEVICE_IDS = {f"kelas-{number}" for number in range(1, 7)}


class SensorPayload(BaseModel):
    device_id: str = Field(min_length=1, max_length=50)
    temperature: float = Field(ge=-40, le=125)
    light_level: float = Field(ge=0, le=100000)


def verify_device_key(x_device_key: str | None = Header(default=None)):
    configured_key = os.getenv("SENSOR_API_KEY")
    if not configured_key:
        raise HTTPException(status_code=503, detail="SENSOR_API_KEY belum dikonfigurasi")
    if not x_device_key or not hmac.compare_digest(x_device_key, configured_key):
        raise HTTPException(status_code=401, detail="Device key tidak valid")


@router.post("/data", dependencies=[Depends(verify_device_key)])
def receive_sensor_data(payload: SensorPayload, db: Session = Depends(get_db)):
    if payload.device_id not in ALLOWED_DEVICE_IDS:
        raise HTTPException(status_code=400, detail="device_id tidak dikenal")

    reading = SensorReading(
        device_id=payload.device_id,
        temperature=payload.temperature,
        light_level=payload.light_level,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    return {
        "message": "Data sensor berhasil disimpan",
        "device_id": reading.device_id,
        "recorded_at": reading.recorded_at,
    }


@router.get("/{device_id}/latest")
def get_latest_reading(device_id: str, db: Session = Depends(get_db)):
    if device_id not in ALLOWED_DEVICE_IDS:
        raise HTTPException(status_code=404, detail="Device tidak ditemukan")

    reading = (
        db.query(SensorReading)
        .filter(SensorReading.device_id == device_id)
        .order_by(SensorReading.recorded_at.desc(), SensorReading.id.desc())
        .first()
    )

    if reading is None:
        return {
            "device_id": device_id,
            "temperature": None,
            "light_level": None,
            "recorded_at": None,
        }

    return {
        "device_id": reading.device_id,
        "temperature": reading.temperature,
        "light_level": reading.light_level,
        "recorded_at": reading.recorded_at,
    }


@router.get("/{device_id}/history")
def get_reading_history(
    device_id: str,
    hours: int = Query(default=24, ge=1, le=720),
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    if device_id not in ALLOWED_DEVICE_IDS:
        raise HTTPException(status_code=404, detail="Device tidak ditemukan")

    since = datetime.utcnow() - timedelta(hours=hours)
    readings = (
        db.query(SensorReading)
        .filter(
            SensorReading.device_id == device_id,
            SensorReading.recorded_at >= since,
        )
        .order_by(SensorReading.recorded_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "temperature": item.temperature,
            "light_level": item.light_level,
            "recorded_at": item.recorded_at,
        }
        for item in readings
    ]

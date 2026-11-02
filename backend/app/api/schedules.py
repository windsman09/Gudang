from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.models.schedule import Schedule
from app.models.facility_booking import FacilityBooking
from app.models.item import Item
from app.schemas.schedule import (
    ScheduleCreate, ScheduleUpdate, ScheduleRead,
    FacilityBookingCreate, FacilityBookingStatus,
)

router = APIRouter(tags=["Jadwal & Peminjaman"])


@router.get("/schedules", response_model=list[ScheduleRead])
def list_schedules(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return db.query(Schedule).order_by(Schedule.start_time.asc()).all()


@router.post("/schedules", response_model=ScheduleRead, status_code=201)
def create_schedule(
    payload: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    conflict = db.query(Schedule).filter(
        Schedule.room == payload.room,
        Schedule.status != "cancelled",
        Schedule.start_time < payload.end_time,
        Schedule.end_time > payload.start_time,
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="Ruang sudah memiliki jadwal pada waktu tersebut")

    schedule = Schedule(**payload.model_dump(), created_by=int(current_user["sub"]))
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.put("/schedules/{schedule_id}", response_model=ScheduleRead)
def update_schedule(
    schedule_id: int,
    payload: ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")

    conflict = db.query(Schedule).filter(
        Schedule.id != schedule_id,
        Schedule.room == payload.room,
        Schedule.status != "cancelled",
        Schedule.start_time < payload.end_time,
        Schedule.end_time > payload.start_time,
    ).first()
    if payload.status != "cancelled" and conflict:
        raise HTTPException(status_code=409, detail="Ruang sudah memiliki jadwal pada waktu tersebut")

    for key, value in payload.model_dump().items():
        setattr(schedule, key, value)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/schedules/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")
    schedule.status = "cancelled"
    db.commit()
    return {"message": "Jadwal dibatalkan"}


@router.get("/facility-bookings")
def list_facility_bookings(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    rows = db.query(FacilityBooking).order_by(FacilityBooking.start_time.desc()).all()
    return [{
        "id": row.id,
        "item_id": row.item_id,
        "item_name": row.item.item_name if row.item else "-",
        "quantity": row.quantity,
        "borrower_name": row.borrower_name,
        "purpose": row.purpose,
        "start_time": row.start_time,
        "end_time": row.end_time,
        "status": row.status,
        "note": row.note,
        "returned_at": row.returned_at,
    } for row in rows]


@router.post("/facility-bookings", status_code=201)
def create_facility_booking(
    payload: FacilityBookingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    item = db.query(Item).filter(Item.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    overlapping = db.query(FacilityBooking).filter(
        FacilityBooking.item_id == payload.item_id,
        FacilityBooking.status == "booked",
        FacilityBooking.start_time < payload.end_time,
        FacilityBooking.end_time > payload.start_time,
    ).all()
    reserved = sum(row.quantity for row in overlapping)
    if reserved + payload.quantity > item.stock:
        raise HTTPException(
            status_code=409,
            detail=f"Jumlah tersedia untuk dipinjam: {max(item.stock - reserved, 0)} {item.unit}",
        )

    booking = FacilityBooking(
        **payload.model_dump(),
        created_by=int(current_user["sub"]),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {"message": "Peminjaman fasilitas berhasil dicatat", "id": booking.id}


@router.patch("/facility-bookings/{booking_id}/status")
def update_facility_booking_status(
    booking_id: int,
    payload: FacilityBookingStatus,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    booking = db.query(FacilityBooking).filter(FacilityBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Data peminjaman tidak ditemukan")
    booking.status = payload.status
    if payload.status == "returned":
        from datetime import datetime
        booking.returned_at = datetime.utcnow()
    elif payload.status == "booked":
        booking.returned_at = None
    db.commit()
    return {"message": "Status peminjaman berhasil diperbarui"}

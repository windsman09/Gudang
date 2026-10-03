from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.item import Item
from app.models.stock_out import StockOut
from app.schemas.stock_out import StockOutCreate


router = APIRouter(
    prefix="/stock-out",
    tags=["Barang Keluar"]
)


@router.post("/")
def create_stock_out(
    payload: StockOutCreate,
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(
        Item.id == payload.item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Barang tidak ditemukan"
        )

    if payload.qty <= 0:
        raise HTTPException(
            status_code=400,
            detail="Jumlah barang harus lebih dari 0"
        )

    if item.stock < payload.qty:
        raise HTTPException(
            status_code=400,
            detail=f"Stok tidak cukup. Stok tersedia: {item.stock}"
        )

    # Kurangi stok barang
    item.stock -= payload.qty

    # Simpan transaksi barang keluar
    stock_out = StockOut(
        item_id=item.id,
        qty=payload.qty,
        destination=payload.destination,
        note=payload.note
    )

    db.add(stock_out)
    db.commit()
    db.refresh(stock_out)

    return {
        "message": "Barang keluar berhasil disimpan",
        "item_id": item.id,
        "item_name": item.item_name,
        "qty": payload.qty,
        "remaining_stock": item.stock
    }


@router.get("/")
def get_stock_out(
    db: Session = Depends(get_db)
):
    return (
        db.query(StockOut)
        .order_by(StockOut.created_at.desc())
        .all()
    )

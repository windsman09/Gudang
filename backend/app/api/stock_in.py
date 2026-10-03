from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.stock_service import StockService

router = APIRouter(
    prefix="/stock-in",
    tags=["Stock In"]
)


@router.post("")
def stock_in(
    item_id: int,
    qty: int,
    db: Session = Depends(get_db)
):
    if qty <= 0:
        raise HTTPException(
            status_code=400,
            detail="Jumlah barang harus lebih dari 0"
        )

    try:
        item = StockService.stock_in(
            db=db,
            item_id=item_id,
            qty=qty
        )

        return {
            "message": "Barang masuk berhasil disimpan",
            "item_id": item.id,
            "item_name": item.item_name,
            "qty": qty,
            "stock": item.stock
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

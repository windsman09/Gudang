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
    no_pr: str,
    db: Session = Depends(get_db)
):
    if qty <= 0:
        raise HTTPException(
            status_code=400,
            detail="Jumlah barang harus lebih dari 0"
        )

    if not no_pr.strip():
        raise HTTPException(
            status_code=400,
            detail="No. PR wajib diisi"
        )

    try:
        item = StockService.stock_in(
            db=db,
            item_id=item_id,
            qty=qty,
            no_pr=no_pr.strip()
        )

        return {
            "message": "Barang masuk berhasil disimpan",
            "item_id": item.id,
            "item_name": item.item_name,
            "qty": qty,
            "no_pr": no_pr.strip(),
            "stock": item.stock
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

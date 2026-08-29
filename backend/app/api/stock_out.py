from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.item import Item
from app.models.stock_out import StockOut

router = APIRouter(prefix="/stock-out", tags=["Stock Out"])


@router.post("")
def stock_out(
        item_id: int,
        qty: int,
        db: Session = Depends (get_db)
):
    item = db.query(Item).get(item_id)

    if item.stock <qty:
        raise HTTPException(
            status_code=400,
            detail="Stock tidak cukup"
        )

    item.stock -= qty
    trx = StockOut(
        item_id=item_id,
        qty=qty,
    )

    db.add(trx)
    db.commit()

    return {"message": "succes"}

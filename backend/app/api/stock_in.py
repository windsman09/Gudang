from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.item import Item
from app.models.stock_in import StockIn

router = APIRouter(prefix="/stock-in", tags=["Stock In"])

@router.post("")
def stock_in(
        item_id: Int,
        qty: int,
        db: Session = Depends(get_db)
):
    item = db.query(Item).get(item_id)

    item.stock += qty

    trx = StockIn(
        item_id=item_id,
        qty=qty,
    )

    db.add(trx)
    db.commit()

    return {"message": "success"}

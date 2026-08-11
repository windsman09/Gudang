from sqlalchemy.orm import Session

from app.models.item import Item
from app.models.stock_in import StockIn
from app.models.stock_out import StockOut



class StockService:

    @staticmethod
    def stock_in(
            db: Session,
            item_id: int,
            qty: int
    ):
            item = db.query(Item).filter(
                Item.id == item_id
        ).first()

    if not item:
        raise ValueError(
            "Barang tidak ditemukan"
        )

    item.stock += qty

    trx = StockIn(
        item_id=item_id,
        qty=qty
    )

    db.add(trx)
    db.commit()
    db.refresh(item)

    return item

@staticmethod
def stock_out(
        db: Session,
        item_id: int,
        qty: int
):

        item - db.query(Item).filter(
            Item.id == item_id
        ).first()


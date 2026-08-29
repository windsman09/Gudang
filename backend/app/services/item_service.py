from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.item import ItemCreate


class ItemService:

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(Item)
            .order_by(Item.item_name.asc())
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        item_id: int
    ):
        return (
            db.query(Item)
            .filter(Item.id == item_id)
            .first()
        )

    @staticmethod
    def get_by_code(
        db: Session,
        item_code: str
    ):
        return (
            db.query(Item)
            .filter(Item.item_code == item_code)
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        payload: ItemCreate
    ):
        existing_item = (
            db.query(Item)
            .filter(Item.item_code == payload.item_code)
            .first()
        )

        if existing_item:
            raise ValueError(
                "Kode barang sudah digunakan"
            )

        item = Item(
            item_code=payload.item_code,
            item_name=payload.item_name,
            category=payload.category,
            unit=payload.unit,
            min_stock=payload.min_stock,
            location=payload.location,
            stock=0
        )

        db.add(item)
        db.commit()
        db.refresh(item)

        return item

    @staticmethod
    def update(
        db: Session,
        item_id: int,
        payload: ItemCreate
    ):
        item = (
            db.query(Item)
            .filter(Item.id == item_id)
            .first()
        )

        if not item:
            return None

        item.item_code = payload.item_code
        item.item_name = payload.item_name
        item.category = payload.category
        item.unit = payload.unit
        item.min_stock = payload.min_stock
        item.location = payload.location

        db.commit()
        db.refresh(item)

        return item

    @staticmethod
    def delete(
        db: Session,
        item_id: int
    ):
        item = (
            db.query(Item)
            .filter(Item.id == item_id)
            .first()
        )

        if not item:
            return False

        db.delete(item)
        db.commit()

        return True

    @staticmethod
    def search(
        db: Session,
        keyword: str
    ):
        return (
            db.query(Item)
            .filter(Item.item_name.ilike(f"%{keyword}%"))
            .all()
        )

    @staticmethod
    def get_low_stock(
        db: Session
    ):
        items = db.query(Item).all()

        return [
            item
            for item in items
            if item.stock <= item.min_stock
        ]

from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class StockIn(Base):
    __tablename__ = "stock_in"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    item_id = Column(
        Integer,
        ForeignKey("items.id"),
        nullable=False
    )

    qty = Column(
        Integer,
        nullable=False
    )

    no_pr = Column(
        String(100),
        nullable=False
    )

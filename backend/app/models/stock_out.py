from datetime import date, datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Date,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class StockOut(Base):
    __tablename__ = "stock_out"

    id = Column(Integer, primary_key=True, index=True)

    item_id = Column(
        Integer,
        ForeignKey("items.id"),
        nullable=False,
    )

    qty = Column(Integer, nullable=False)

    user = Column(String, nullable=False)

    destination = Column(String, nullable=False)

    # Tanggal barang benar-benar digunakan
    usage_date = Column(Date, nullable=True)

    note = Column(String, nullable=True)

    # Tanggal dan waktu transaksi dicatat
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    item = relationship("Item")

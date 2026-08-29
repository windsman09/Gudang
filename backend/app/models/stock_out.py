from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime

from app.core.database import Base

class StockOut(Base):
    __tablename__ = "stock_out"

    id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    qty = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

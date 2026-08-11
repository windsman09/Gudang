from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime

from app.core.database import Base

class StockIn(Base):
    __tablename__ = "stock_in"
    
    id = Column(Integer, primary-key=True)
    item_id = Column(Integer, ForeignKey("items_id"))
    qty = Column(integer)
    created_at = Column(DateTime, default=datetime.utcnow)

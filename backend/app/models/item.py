from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String, unique=True)
    item_name = Column(String)
    category = Column(String)
    unit = Column(String)
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    location = Column(String)


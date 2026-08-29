from pydantic import BaseModel
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.core.database import get_db



class ItemBase(BaseModel):
    item_code: str
    item_name: str
    category: str
    unit: str
    min_stock: int
    location: str


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    pass


class ItemResponse(ItemBase):
    id: int
    stock: int

    class Config:
        from_attributes = True

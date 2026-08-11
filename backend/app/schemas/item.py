from pydantic import BaseModel

class ItemCreate(BaseModel):
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

from pydantic import BaseModel


class StockOutCreate(BaseModel):
    item_id: int
    qty: int
    destination: str | None = None
    note: str | None = None

from pydantic import BaseModel, Field


class StockOutCreate(BaseModel):
    item_id: int
    qty: int
    destination: str = Field(..., min_lengt=1)
    note: str | None = None
    user: str = Field(..., min_length=1)

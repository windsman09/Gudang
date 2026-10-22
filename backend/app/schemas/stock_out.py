from datetime import date

from pydantic import BaseModel, Field


class StockOutCreate(BaseModel):
    item_id: int = Field(..., gt=0)
    qty: int = Field(..., gt=0)

    destination: str = Field(..., min_length=1)
    user: str = Field(..., min_length=1)

    usage_date: date

    note: str | None = None

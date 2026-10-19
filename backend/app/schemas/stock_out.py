from pydantic import BaseModel, Field


class StockOutCreate(BaseModel):
    item_id: int
    qty: int
<<<<<<< HEAD
    destination: str = Field(..., min_lengt=1)
    note: str | None = None
    user: str = Field(..., min_length=1)
=======
    destination: str = Field(...,min_length=1)
    note: str | None = None
    user: str = Field(...,min_length=1)
>>>>>>> 1efd356bd262d0fd2da41665cbe1dd21fd67be13

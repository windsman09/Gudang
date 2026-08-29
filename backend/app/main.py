from fastapi import FastAPI

from app.core.database import Base
from app.core.database import engine

from app.api import items
from app.api import stock_in
from app.api import stock_out

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Warehouse Management")


app.include_router(items.router)
app.include_router(stock_in.router)
app.include_router(stock_out.router)


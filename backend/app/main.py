from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base
from app.core.database import engine
from app.api import auth

from app.api import items
from app.api import stock_in
from app.api import stock_out

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Warehouse Management")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router)
app.include_router(stock_in.router)
app.include_router(stock_out.router)
app.include_router(auth.router)

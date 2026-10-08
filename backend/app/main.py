from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.api import auth, users, items, stock_in, stock_out
# Import model jika diperlukan registrasi eksplisit ke SQLAlchemy metadata
from app.models.stock_out import StockOut


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Membuat tabel database secara otomatis saat server dinyalakan
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Warehouse Management", lifespan=lifespan)

# Setup CORS untuk React (Vite)
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

# Registrasi Router
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(items.router)
app.include_router(stock_in.router)
app.include_router(stock_out.router)

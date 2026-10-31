from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.api import auth, users, items, stock_in, stock_out, export, modbus, device, usage, sensors
from app.models.stock_out import StockOut
from app.models.sensor_reading import SensorReading


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="ME Syahdan e", lifespan=lifespan)

# Setup CORS untuk React (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.21.6.147:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrasi Route
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(items.router)
app.include_router(stock_in.router)
app.include_router(stock_out.router)
app.include_router(export.router)
app.include_router(device.router)
app.include_router(modbus.router)
app.include_router(usage.router)
app.include_router(sensors.router)

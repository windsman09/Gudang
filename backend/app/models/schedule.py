from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Text

from app.core.database import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    room = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    organizer = Column(String(150), nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="scheduled")
    created_by = Column(Integer, nullable=False, index=True)
    outlook_event_id = Column(String(255), nullable=True)
    outlook_sync_status = Column(String(30), nullable=False, default="not_connected")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

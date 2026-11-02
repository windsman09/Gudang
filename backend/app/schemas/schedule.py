from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator


class ScheduleCreate(BaseModel):
    room: str = Field(..., pattern=r"^kelas-[1-6]$")
    title: str = Field(..., min_length=2, max_length=200)
    organizer: str = Field(..., min_length=2, max_length=150)
    start_time: datetime
    end_time: datetime
    description: str | None = None

    @model_validator(mode="after")
    def validate_time(self):
        if self.end_time <= self.start_time:
            raise ValueError("Waktu selesai harus setelah waktu mulai")
        return self


class ScheduleUpdate(ScheduleCreate):
    status: str = Field(default="scheduled", pattern=r"^(scheduled|cancelled)$")


class ScheduleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    room: str
    title: str
    organizer: str
    start_time: datetime
    end_time: datetime
    description: str | None
    status: str
    created_by: int
    outlook_sync_status: str


class FacilityBookingCreate(BaseModel):
    item_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    borrower_name: str = Field(..., min_length=2, max_length=150)
    purpose: str = Field(..., min_length=2, max_length=255)
    start_time: datetime
    end_time: datetime
    note: str | None = None

    @model_validator(mode="after")
    def validate_time(self):
        if self.end_time <= self.start_time:
            raise ValueError("Waktu selesai harus setelah waktu mulai")
        return self


class FacilityBookingStatus(BaseModel):
    status: str = Field(..., pattern=r"^(booked|returned|cancelled)$")

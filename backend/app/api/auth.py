from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):

    result = AuthService.login(
        db=db,
        username=payload.username,
        password=payload.password
    )

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Username atau password salah"
        )
    return result

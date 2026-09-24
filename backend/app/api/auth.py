from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
<<<<<<< HEAD
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, LoginResponse
=======
from app.core.security import (
    verify_password,
    create_access_token
)
from app.models.user import User
>>>>>>> origin/windows


router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Username atau password salah"
        )

    if not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Username atau password salah"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

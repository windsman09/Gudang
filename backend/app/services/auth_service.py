from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import verify_password, create_access_token


class AuthService:

    @staticmethod
    def login(
        db: Session,
        username: str,
        password: str
    ):
        user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if not user:
            return None

        if not verify_password(password, user.password):
            return None

        token = create_access_token(
            {
                "sub": str(user.id),
                "username": user.username,
                "role": user.role
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

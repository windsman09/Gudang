from sqlalchemy.orm import Session
form app.models.user import user
from app.core.security import (verify_password, create_access_token)


class AuthService:

    @staticmethod
        def login(
            db: Session,
            username: str,
    ):
        user = (
            db.query(User)
            .filter(
                user.username == username
            )
            .first()
        )
        if not user:
            return None
        token = create_access_token(
            {
                "sub": str(user.id),
                "username": user.usrname,
                "rule": user.rule
            }
        )
        return{
            "access_token": token,
            "token_type": "bearer"
        }

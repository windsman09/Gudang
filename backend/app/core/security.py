from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt


SECRET_KEY = "YOUR_SUPER_SECRET_KEY"
ALGORITHM = "HS256"


def hash_password(password: str):
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str
):
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(data: dict):
    payload = data.copy()

    payload["exp"] = (
        datetime.now(timezone.utc) +
        timedelta(hours=8)
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_token(token: str):
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

    except JWTError:
        return None

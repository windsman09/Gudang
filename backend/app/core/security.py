from datetime import datetime, timedelta

from jose import jwt

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
)

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

def create_access_token(data: dict):

    payload = data.copy()

    payload["exp"]= (
        datetime.utcnow() +
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

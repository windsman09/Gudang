from datetime import datetime, timedelta

from jose import jwt

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

def create_access_token(data: dict)

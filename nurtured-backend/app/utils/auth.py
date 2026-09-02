from datetime import datetime, timedelta
import secrets
import bcrypt
import jwt
from fastapi import Depends, HTTPException
from pydantic import BaseModel

from ..config import ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET, ALGORITHM


class AdminLoginRequest(BaseModel):
    username: str
    password: str


def authenticate_admin(login_data: AdminLoginRequest):
    """Authenticate admin user against environment-configured credentials.

    Uses constant-time comparison to mitigate timing attacks.
    Password is verified against the plain text password from env var.
    """
    username_valid = secrets.compare_digest(login_data.username, ADMIN_USERNAME)

    # Compare the plain text password directly
    password_valid = secrets.compare_digest(login_data.password, ADMIN_PASSWORD)

    if not (username_valid and password_valid):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    return login_data.username


def create_token(username: str):
    """Create a JWT token for an authenticated admin."""
    expire = datetime.utcnow() + timedelta(hours=8)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def verify_token(token: str):
    """Verify a JWT token and return the username.

    Raises HTTPException if the token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
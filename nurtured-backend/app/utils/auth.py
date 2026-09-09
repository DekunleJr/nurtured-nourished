from datetime import datetime, timedelta, timezone
import secrets
import bcrypt
import jwt
from fastapi import Request
from pydantic import BaseModel

from ..config import (
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    ADMIN_PASSWORD_HASH,
    JWT_SECRET,
    ALGORITHM,
    SESSION_COOKIE,
)


class AdminLoginRequest(BaseModel):
    username: str
    password: str


def authenticate_admin(login_data: AdminLoginRequest):
    """Authenticate admin user against environment-configured credentials.

    Uses constant-time comparison for the username and bcrypt for the password,
    so the raw password is never stored or compared in plaintext.
    """
    username_valid = secrets.compare_digest(login_data.username, ADMIN_USERNAME)
    password_valid = bcrypt.checkpw(
        login_data.password.encode("utf-8"), ADMIN_PASSWORD_HASH.encode("utf-8")
    )

    if not (username_valid and password_valid):
        return None

    return login_data.username


def create_token(username: str) -> str:
    """Create a JWT token for an authenticated admin."""
    expire = datetime.now(timezone.utc) + timedelta(hours=8)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> str:
    """Verify a JWT token and return the username.

    Raises jwt.PyJWTError if the token is invalid or expired — callers can
    translate that into a 401 response.
    """
    payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    return payload["sub"]


def get_current_admin(request: Request) -> str:
    """FastAPI dependency: verify the admin session cookie and return the username.

    Raises an HTTPException(401) when the session cookie is missing, malformed,
    expired, or otherwise invalid. Every admin-protected endpoint should
    depend on this.
    """
    from fastapi import HTTPException

    session = request.cookies.get(SESSION_COOKIE)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return verify_token(session)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
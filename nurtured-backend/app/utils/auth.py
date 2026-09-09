from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt
from fastapi import Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import JWT_SECRET, ALGORITHM, SESSION_COOKIE
from ..models import AdminUser

# Pre-computed once at startup so that logins for unknown emails can run a
# bcrypt check anyway — keeps response timing uniform and prevents attackers
# from discovering valid admin emails via timing side-channels.
_DUMMY_HASH = bcrypt.hashpw(b"timing-equaliser", bcrypt.gensalt())


class AdminLoginRequest(BaseModel):
    email: str
    password: str


def _normalise_email(email: str) -> str:
    return email.strip().lower()


def authenticate_admin(db: Session, email: str, password: str) -> tuple[Optional[AdminUser], str]:
    """Authenticate an admin against the `admins` table.

    Returns (admin, reason). On success admin is the AdminUser row and reason
    is ''. On failure admin is None and reason explains why:
      'unknown_email' | 'bad_password' | 'inactive'
    Timing is equalised so unknown emails cost the same as known ones.
    """
    admin = (
        db.query(AdminUser)
        .filter(
            AdminUser.email == _normalise_email(email),
            AdminUser.is_deleted == False,  # noqa: E712
        )
        .first()
    )
    if not admin:
        # Run a bcrypt check anyway so unknown emails take the same time as
        # known ones (see _DUMMY_HASH above).
        bcrypt.checkpw(password.encode("utf-8"), _DUMMY_HASH)
        return None, "unknown_email"
    if not bcrypt.checkpw(password.encode("utf-8"), admin.password_hash.encode("utf-8")):
        return None, "bad_password"
    if not admin.is_active:
        return None, "inactive"
    return admin, ""


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt for storage."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_token(admin: AdminUser) -> str:
    """Create a JWT token for an authenticated admin."""
    expire = datetime.now(timezone.utc) + timedelta(hours=8)
    payload = {
        "sub": str(admin.id),
        "email": admin.email,
        "name": admin.name,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> Dict[str, Any]:
    """Verify a JWT token and return its payload.

    Raises jwt.PyJWTError if the token is invalid or expired — callers can
    translate that into a 401 response.
    """
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])


def get_current_admin(request: Request) -> Dict[str, Any]:
    """FastAPI dependency: verify the admin session cookie and return the payload.

    Raises HTTPException(401) when the session cookie is missing, malformed,
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
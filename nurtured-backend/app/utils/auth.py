from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt
from fastapi import Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import JWT_SECRET, ALGORITHM, SESSION_COOKIE, SESSION_MAX_AGE
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


def create_token(subject_id: int, email: str, name: str, role: str) -> str:
    """Create a JWT for an authenticated admin or customer.

    `role` is "admin" or "user" and is the claim every guard checks — one cookie
    and one signing secret therefore serve both the dashboard and the customer
    area without either being able to impersonate the other.
    """
    expire = datetime.now(timezone.utc) + timedelta(seconds=SESSION_MAX_AGE)
    payload = {
        "sub": str(subject_id),
        "email": email,
        "name": name,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> Dict[str, Any]:
    """Verify a JWT token and return its payload.

    Raises jwt.PyJWTError if the token is invalid or expired — callers can
    translate that into a 401 response.
    """
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])


def _decode_session(request: Request) -> Dict[str, Any]:
    """Decode the session cookie into its JWT payload, or raise HTTP 401."""
    from fastapi import HTTPException

    session = request.cookies.get(SESSION_COOKIE)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return verify_token(session)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_admin(request: Request) -> Dict[str, Any]:
    """FastAPI dependency: verify the session cookie AND that it is an admin.

    Raises HTTPException(401) when the cookie is missing, malformed or expired,
    and 403 when the session is a valid *customer* session. Every
    admin-protected endpoint should depend on this.
    """
    from fastapi import HTTPException

    payload = _decode_session(request)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin session required")
    return payload


def get_current_user(request: Request) -> Dict[str, Any]:
    """FastAPI dependency: verify the session cookie AND that it is a customer.

    Mirrors get_current_admin so a customer token can never reach an admin
    endpoint, and an admin token can never reach a customer endpoint by accident.
    """
    from fastapi import HTTPException

    payload = _decode_session(request)
    if payload.get("role") != "user":
        raise HTTPException(status_code=403, detail="Customer session required")
    return payload
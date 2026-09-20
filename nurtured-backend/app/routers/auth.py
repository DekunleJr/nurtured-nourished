"""Unified authentication: admin + user accounts, single login endpoint.

POST /api/auth/register   -> create a customer account AND sign them straight in
POST /api/auth/login      -> authenticate an admin OR a customer by email; token carries role
POST /api/auth/logout     -> clear session cookie
GET  /api/auth/me         -> current admin/user from session token
GET  /api/auth/verify     -> session role check used by the admin header + route guards

The JWT's `role` claim is what keeps the two audiences apart: every guarded
endpoint checks it, so a customer token cannot reach the dashboard and an admin
token cannot reach the customer checkout/course endpoints.
"""

from datetime import date
from typing import Any, Dict, Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from ..config import COOKIE_SECURE, SESSION_COOKIE, SESSION_MAX_AGE
from ..database import get_db
from ..models import AdminUser, UserAccount
from ..schemas import _EMAIL_PATTERN
from ..utils.auth import (
    _DUMMY_HASH,
    _normalise_email,
    authenticate_admin,
    create_token,
    verify_token,
)
from ..utils.login_throttle import (
    clear_login_failures,
    client_ip,
    login_locked,
    record_login_failure,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    due_date: str = Field(..., min_length=1, max_length=32)
    phone: str = Field(default="", max_length=32)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("name", "phone")
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        return v.strip()

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: str) -> str:
        """Require a real calendar date (YYYY-MM-DD).

        The checkout flow compares this date against cohort end dates, so a
        value that cannot be parsed would silently hide every cohort.
        """
        value = v.strip()
        try:
            date.fromisoformat(value)
        except ValueError as exc:
            raise ValueError("Enter your due date as YYYY-MM-DD") from exc
        return value


class UserLoginRequest(BaseModel):
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class AuthMeResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str  # "admin" | "user"
    due_date: Optional[str] = None
    phone: Optional[str] = None


def _set_session_cookie(response: Response, token: str) -> None:
    """Set the single session cookie both roles share.

    `secure` follows the environment (config.COOKIE_SECURE) because a Secure
    cookie cannot be stored over http://localhost — setting it unconditionally
    makes local login appear to succeed and then silently not persist. `samesite`
    is "lax" so the cookie survives the top-level redirect back from Stripe.
    """
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=SESSION_COOKIE, path="/")


def _user_payload(user: UserAccount) -> Dict[str, Any]:
    """The customer fields the frontend needs to resume the checkout flow."""
    return {
        "role": "user",
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "due_date": user.due_date,
        "phone": user.phone,
    }


def _get_user_from_token(token: str, db: Session) -> Optional[AuthMeResponse]:
    try:
        payload = verify_token(token)
    except jwt.PyJWTError:
        return None
    role = payload.get("role")
    sub = payload.get("sub")
    if not role or not sub:
        return None
    if role == "admin":
        admin = db.query(AdminUser).filter(AdminUser.id == int(sub), AdminUser.is_deleted == False).first()
        if not admin:
            return None
        return AuthMeResponse(id=admin.id, email=admin.email, name=admin.name, role="admin")
    if role == "user":
        user = (
            db.query(UserAccount)
            .filter(UserAccount.id == int(sub), UserAccount.is_deleted == False, UserAccount.is_active == True)
            .first()
        )
        if not user:
            return None
        return AuthMeResponse(id=user.id, email=user.email, name=user.name, role="user", due_date=user.due_date, phone=user.phone)
    return None


@router.post("/register", status_code=201)
def register(response: Response, payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """Create a customer account and sign them in immediately.

    Signing in as part of registration is what lets checkout send a brand-new
    customer to /register and have them land back on the step they left, rather
    than being bounced to a login form they have no password for yet.
    """
    norm = _normalise_email(payload.email)
    if db.query(UserAccount).filter(UserAccount.email == norm, UserAccount.is_deleted == False).first():  # noqa: E712
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    if db.query(AdminUser).filter(AdminUser.email == norm, AdminUser.is_deleted == False).first():  # noqa: E712
        raise HTTPException(status_code=409, detail="This email is already in use by an admin account")
    user = UserAccount(
        name=payload.name.strip(),
        email=norm,
        phone=payload.phone.strip(),
        due_date=payload.due_date.strip(),
        password_hash=bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_session_cookie(response, create_token(user.id, user.email, user.name, "user"))
    return _user_payload(user)


@router.post("/login")
def login(
    request: Request,
    response: Response,
    payload: UserLoginRequest,
    db: Session = Depends(get_db),
):
    """Sign in as either an admin or a customer with one email/password form.

    Admins are checked first because admin accounts are the rarer case and the
    lookup is indexed. Both failures return the same message so the endpoint
    never reveals which kind of account (if any) owns an email address.
    """
    ip = client_ip(request)
    if login_locked(ip):
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Please try again in 15 minutes.",
        )

    norm = _normalise_email(payload.email)

    admin, _reason = authenticate_admin(db, norm, payload.password)
    if admin is not None:
        clear_login_failures(ip)
        _set_session_cookie(response, create_token(admin.id, admin.email, admin.name, "admin"))
        return {"role": "admin", "id": admin.id, "email": admin.email, "name": admin.name}

    user = (
        db.query(UserAccount)
        .filter(UserAccount.email == norm, UserAccount.is_deleted == False)  # noqa: E712
        .first()
    )
    # A blank password_hash means the row predates customer passwords (created
    # before this feature). Treat it as a failed login rather than handing the
    # hash to bcrypt, which would raise on an invalid salt.
    if user is None or not user.password_hash:
        bcrypt.checkpw(payload.password.encode("utf-8"), _DUMMY_HASH)
        record_login_failure(ip)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not bcrypt.checkpw(payload.password.encode("utf-8"), user.password_hash.encode("utf-8")):
        record_login_failure(ip)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated")

    clear_login_failures(ip)
    _set_session_cookie(response, create_token(user.id, user.email, user.name, "user"))
    return _user_payload(user)


@router.post("/logout")
def logout(response: Response = Response()):
    _clear_session_cookie(response)
    return {"ok": True}


@router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = _get_user_from_token(token, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user


@router.get("/verify")
def verify(request: Request, db: Session = Depends(get_db)):
    """Cheap session check for route guards.

    `valid` is included so the existing admin header/guard code can consume this
    endpoint unchanged after the unified login replaces /api/admin/verify.
    """
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = _get_user_from_token(token, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return {
        "valid": True,
        "role": user.role,
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }
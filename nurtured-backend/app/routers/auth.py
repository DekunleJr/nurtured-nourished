"""Unified authentication: admin + user accounts, single login endpoint.

POST /api/auth/register   -> create an unverified customer account + send OTP
POST /api/auth/verify-email -> verify registration OTP + create customer session
POST /api/auth/resend-verification -> resend a registration OTP
POST /api/auth/login      -> authenticate an admin OR a verified customer by email/password
POST /api/auth/logout     -> clear session cookie
GET  /api/auth/me         -> current admin/user from session token
GET  /api/auth/verify     -> session role check used by the admin header + route guards

The JWT's `role` claim is what keeps the two audiences apart: every guarded
endpoint checks it, so a customer token cannot reach the dashboard and an admin
token cannot reach the customer checkout/course endpoints.
"""

import hashlib
import secrets
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from ..config import COOKIE_SECURE, PUBLIC_SITE_URL, SESSION_COOKIE, SESSION_MAX_AGE
from ..database import get_db
from ..email import send_email_verification_otp, send_password_reset_email
from ..models import AdminUser, EmailVerificationToken, PasswordResetToken, UserAccount
from ..rate_limit import limiter
from ..schemas import _EMAIL_PATTERN
from ..utils.auth import (
    _DUMMY_HASH,
    _normalise_email,
    authenticate_admin,
    create_token,
    hash_password,
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


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)

    @field_validator("email", mode="before")
    @classmethod
    def normalise_email(cls, value: str) -> str:
        return value.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=20, max_length=256)
    password: str = Field(..., min_length=8, max_length=128)


class EmailVerificationRequest(BaseModel):
    challenge_token: str = Field(..., min_length=20, max_length=256)
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]{6}$")


class ResendVerificationRequest(BaseModel):
    challenge_token: str = Field(..., min_length=20, max_length=256)


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
        "email_verified": user.is_email_verified,
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
            .filter(
                UserAccount.id == int(sub),
                UserAccount.is_deleted == False,  # noqa: E712
                UserAccount.is_active == True,  # noqa: E712
                UserAccount.is_email_verified == True,  # noqa: E712
            )
            .first()
        )
        if not user:
            return None
        return AuthMeResponse(id=user.id, email=user.email, name=user.name, role="user", due_date=user.due_date, phone=user.phone)
    return None


def _token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _otp_digest(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()


def _new_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _new_challenge() -> str:
    return secrets.token_urlsafe(32)


def _verification_challenge(db: Session, challenge_token: str) -> Optional[EmailVerificationToken]:
    return (
        db.query(EmailVerificationToken)
        .filter(EmailVerificationToken.challenge_token_hash == _token_digest(challenge_token))
        .first()
    )


def _generic_reset_response() -> dict:
    return {
        "message": "If an account exists for that email, password reset instructions have been sent.",
    }


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Start customer password recovery without revealing account existence."""
    user = (
        db.query(UserAccount)
        .filter(
            UserAccount.email == _normalise_email(payload.email),
            UserAccount.is_deleted == False,  # noqa: E712
            UserAccount.is_active == True,  # noqa: E712
        )
        .first()
    )
    if user is not None:
        now = datetime.now(timezone.utc)
        old_tokens = (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at == None,  # noqa: E711
            )
            .all()
        )
        for old_token in old_tokens:
            old_token.used_at = now
        raw_token = secrets.token_urlsafe(32)
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=_token_digest(raw_token),
                expires_at=now + timedelta(hours=1),
            )
        )
        db.commit()
        reset_url = f"{PUBLIC_SITE_URL}/reset-password?token={raw_token}"
        send_password_reset_email(user.email, reset_url)

    return _generic_reset_response()


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Consume a valid customer reset token and set a new password."""
    now = datetime.now(timezone.utc)
    reset_row = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == _token_digest(payload.token),
            PasswordResetToken.used_at == None,  # noqa: E711
            PasswordResetToken.expires_at > now,
        )
        .first()
    )
    if reset_row is None:
        raise HTTPException(status_code=400, detail="This password reset link is invalid or has expired.")

    user = (
        db.query(UserAccount)
        .filter(
            UserAccount.id == reset_row.user_id,
            UserAccount.is_deleted == False,  # noqa: E712
            UserAccount.is_active == True,  # noqa: E712
        )
        .first()
    )
    if user is None:
        raise HTTPException(status_code=400, detail="This password reset link is invalid or has expired.")

    user.password_hash = hash_password(payload.password)
    reset_row.used_at = now
    db.commit()
    return {"message": "Your password has been reset. You can now sign in."}


@router.post("/verify-email")
@limiter.limit("10/minute")
def verify_email(
    request: Request,
    response: Response,
    payload: EmailVerificationRequest,
    db: Session = Depends(get_db),
):
    """Verify a registration OTP and only then create the customer session."""
    now = datetime.now(timezone.utc)
    challenge = _verification_challenge(db, payload.challenge_token)
    user = None if challenge is None else db.get(UserAccount, challenge.user_id)
    if (
        challenge is None
        or challenge.used_at is not None
        or challenge.expires_at <= now
        or challenge.attempts >= 5
        or user is None
        or user.is_deleted
        or not user.is_active
    ):
        raise HTTPException(status_code=400, detail="This verification code is invalid or has expired.")

    if challenge.otp_hash != _otp_digest(payload.otp):
        challenge.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="That verification code is not correct.")

    challenge.used_at = now
    user.is_email_verified = True
    user.email_verified_at = now
    db.commit()
    db.refresh(user)
    _set_session_cookie(response, create_token(user.id, user.email, user.name, "user"))
    return _user_payload(user)


@router.post("/resend-verification")
@limiter.limit("5/minute")
def resend_verification(
    request: Request,
    payload: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    """Issue a fresh OTP for an active, unverified registration challenge."""
    now = datetime.now(timezone.utc)
    challenge = _verification_challenge(db, payload.challenge_token)
    user = None if challenge is None else db.get(UserAccount, challenge.user_id)
    if (
        challenge is not None
        and challenge.used_at is None
        and challenge.expires_at > now
        and user is not None
        and not user.is_deleted
        and user.is_active
        and not user.is_email_verified
    ):
        otp = _new_otp()
        challenge.otp_hash = _otp_digest(otp)
        challenge.attempts = 0
        challenge.expires_at = now + timedelta(minutes=10)
        db.commit()
        send_email_verification_otp(user.email, otp)

    return {"message": "If the registration is still pending, a new verification code has been sent."}


@router.post("/register", status_code=201)
def register(response: Response, payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """Create an unverified customer account and send its registration OTP."""
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
        is_email_verified=False,
    )
    challenge_token = _new_challenge()
    otp = _new_otp()
    db.add(user)
    db.commit()
    db.refresh(user)
    db.add(
        EmailVerificationToken(
            user_id=user.id,
            challenge_token_hash=_token_digest(challenge_token),
            otp_hash=_otp_digest(otp),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        )
    )
    db.commit()
    send_email_verification_otp(user.email, otp)
    return {
        "verification_required": True,
        "challenge_token": challenge_token,
        "email": user.email,
        "message": "Check your email for your six-digit verification code.",
    }


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
    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")

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
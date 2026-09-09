from datetime import datetime, timedelta, timezone
from typing import Dict, List, Literal

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ContactMessage, DiscoveryIntake, Lead
from ..utils.auth import (
    AdminLoginRequest,
    authenticate_admin,
    create_token,
    verify_token,
    get_current_admin,
)
from ..config import SESSION_COOKIE

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Types accepted by the generic list/archive/restore/export endpoints.
SubmissionType = Literal["leads", "discovery", "contacts"]

_SESSION_MAX_AGE = 8 * 60 * 60  # 8 hours


# --- Pydantic Response Models ---
class LeadResponse(BaseModel):
    id: int
    organisation: str
    contact_name: str
    job_title: str
    email: str
    goals: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool


class DiscoveryResponse(BaseModel):
    id: int
    name: str
    email: str
    due_date: str
    postcode: str
    package: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool


class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool


class StatsResponse(BaseModel):
    total: int
    new_this_week: int


class DashboardResponse(BaseModel):
    stats: Dict[str, dict]


class ListResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    per_page: int


# --- Serialisation helpers (single source of truth for list + export) ---
def _serialise_lead(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "organisation": lead.organisation,
        "contact_name": lead.contact_name,
        "job_title": lead.job_title,
        "email": lead.email,
        "goals": lead.goals,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
        "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
        "is_deleted": lead.is_deleted,
    }


def _serialise_discovery(discovery: DiscoveryIntake) -> dict:
    return {
        "id": discovery.id,
        "name": discovery.name,
        "email": discovery.email,
        "due_date": discovery.due_date,
        "postcode": discovery.postcode,
        "package": discovery.package,
        "created_at": discovery.created_at.isoformat() if discovery.created_at else None,
        "updated_at": discovery.updated_at.isoformat() if discovery.updated_at else None,
        "is_deleted": discovery.is_deleted,
    }


def _serialise_contact(contact: ContactMessage) -> dict:
    return {
        "id": contact.id,
        "name": contact.name,
        "email": contact.email,
        "subject": contact.subject,
        "message": contact.message,
        "created_at": contact.created_at.isoformat() if contact.created_at else None,
        "updated_at": contact.updated_at.isoformat() if contact.updated_at else None,
        "is_deleted": contact.is_deleted,
    }


_SERIALISERS = {
    "leads": (Lead, _serialise_lead),
    "discovery": (DiscoveryIntake, _serialise_discovery),
    "contacts": (ContactMessage, _serialise_contact),
}

# Which columns count as "name-ish" for search queries on each type.
_SEARCH_TERMS: Dict[str, list] = {
    "leads": ["organisation", "contact_name", "email"],
    "discovery": ["name", "email"],
    "contacts": ["name", "email", "subject"],
}

# Sort columns we allow — prevents SQL injection via raw column names.
_SORT_COLUMNS = {
    "leads": {
        "created_at": Lead.created_at,
        "updated_at": Lead.updated_at,
        "name": Lead.contact_name,
    },
    "discovery": {
        "created_at": DiscoveryIntake.created_at,
        "updated_at": DiscoveryIntake.updated_at,
        "name": DiscoveryIntake.name,
    },
    "contacts": {
        "created_at": ContactMessage.created_at,
        "updated_at": ContactMessage.updated_at,
        "name": ContactMessage.name,
    },
}

_CSV_HEADERS = {
    "leads": ["id", "organisation", "contact_name", "job_title", "email", "goals", "created_at", "updated_at"],
    "discovery": ["id", "name", "email", "due_date", "postcode", "package", "created_at", "updated_at"],
    "contacts": ["id", "name", "email", "subject", "message", "created_at", "updated_at"],
}


# --- Small in-memory login throttle (per IP) ---
# Simple failed-attempt lockout: N failures in a sliding window block further
# login attempts from that IP.
_LOGIN_FAILURES: Dict[str, list] = {}
_LOGIN_LOCK_SECONDS = 15 * 60
_LOGIN_MAX_FAILURES = 5


def _record_login_failure(ip: str) -> None:
    now = datetime.now(timezone.utc)
    attempts = [t for t in _LOGIN_FAILURES.get(ip, []) if t > now - timedelta(seconds=_LOGIN_LOCK_SECONDS)]
    attempts.append(now)
    _LOGIN_FAILURES[ip] = attempts


def _login_locked(ip: str) -> bool:
    now = datetime.now(timezone.utc)
    attempts = [t for t in _LOGIN_FAILURES.get(ip, []) if t > now - timedelta(seconds=_LOGIN_LOCK_SECONDS)]
    _LOGIN_FAILURES[ip] = attempts
    return len(attempts) >= _LOGIN_MAX_FAILURES


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _get_model_and_serialiser(submission_type: str):
    try:
        return _SERIALISERS[submission_type]
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown submission type")


# --- Routes ---
@router.post("/auth")
def login(request: Request, response: Response, login_data: AdminLoginRequest):
    """Authenticate with username/password (JSON body) and set a session cookie.

    The JWT is only ever delivered via the HttpOnly cookie — it is not
    returned in the response body. Failed attempts are throttled per-IP.
    """
    ip = _client_ip(request)
    if _login_locked(ip):
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Please try again in 15 minutes.",
        )

    username = authenticate_admin(login_data)
    if not username:
        _record_login_failure(ip)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(username)
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=_SESSION_MAX_AGE,
        path="/",
    )

    return {"message": "Authenticated", "username": username}


@router.post("/logout")
def logout(response: Response):
    """Clear the admin session cookie."""
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"message": "Logged out"}


@router.get("/verify")
def verify_session(request: Request, _admin: str = Depends(get_current_admin)):
    """Verify the current session cookie (requires a valid admin session)."""
    return {"valid": True, "username": _admin}


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard_stats(
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return counts (and 'new this week') across all three submission types."""
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    stats: Dict[str, dict] = {}

    for kind, (model, _) in _SERIALISERS.items():
        total = db.query(func.count(model.id)).filter(model.is_deleted == False).scalar()  # noqa: E712
        new_this_week = (
            db.query(func.count(model.id))
            .filter(model.is_deleted == False, model.created_at >= week_ago)  # noqa: E712
            .scalar()
        )
        stats[kind] = {"total": int(total or 0), "new_this_week": int(new_this_week or 0)}

    return {"stats": stats}


@router.get("/{submission_type}", response_model=ListResponse)
def list_submissions(
    submission_type: SubmissionType,
    page: int = 1,
    per_page: int = 10,
    q: str = "",
    sort: str = "created_at",
    order: str = "desc",
    include_deleted: bool = False,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Paginated, searchable, sortable listing for a submission type."""
    model, serialise = _get_model_and_serialiser(submission_type)

    page = max(1, page)
    per_page = min(max(1, per_page), 100)

    sort_map = _SORT_COLUMNS[submission_type]
    sort_col = sort_map.get(sort, model.created_at)
    sort_order = sort_col.desc() if order.lower() == "desc" else sort_col.asc()

    query = db.query(model)
    if not include_deleted:
        query = query.filter(model.is_deleted == False)  # noqa: E712

    if q.strip():
        terms = _SEARCH_TERMS[submission_type]
        like = f"%{q.strip()}%"
        query = query.filter(or_(*[getattr(model, t).ilike(like) for t in terms]))

    total = query.count()
    rows = (
        query.order_by(sort_order)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "items": [serialise(row) for row in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.patch("/{submission_type}/{item_id}/archive")
def archive_item(
    submission_type: SubmissionType,
    item_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete a submission (sets is_deleted = True)."""
    model, serialise = _get_model_and_serialiser(submission_type)
    row = db.get(model, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    row.is_deleted = True
    db.commit()
    db.refresh(row)
    return serialise(row)


@router.patch("/{submission_type}/{item_id}/restore")
def restore_item(
    submission_type: SubmissionType,
    item_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Restore a soft-deleted submission (sets is_deleted = False)."""
    model, serialise = _get_model_and_serialiser(submission_type)
    row = db.get(model, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    row.is_deleted = False
    db.commit()
    db.refresh(row)
    return serialise(row)


@router.get("/{submission_type}/export")
def export_submissions(
    submission_type: SubmissionType,
    include_deleted: bool = False,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Stream the full dataset for a type as CSV."""
    model, serialise = _get_model_and_serialiser(submission_type)

    query = db.query(model)
    if not include_deleted:
        query = query.filter(model.is_deleted == False)  # noqa: E712

    headers = _CSV_HEADERS[submission_type]
    lines = [",".join(headers)]
    for row in query.order_by(model.created_at.desc()).all():
        data = serialise(row)
        values = []
        for h in headers:
            raw = data.get(h, "")
            if raw is None:
                raw = ""
            value = str(raw)
            if "," in value or '"' in value or "\n" in value:
                value = '"' + value.replace('"', '""') + '"'
            values.append(value)
        lines.append(",".join(values))
    csv_body = "\n".join(lines)

    return PlainTextResponse(
        content=csv_body,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{submission_type}-export.csv"'
        },
    )

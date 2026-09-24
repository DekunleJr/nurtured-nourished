"""Admin management of customer accounts (user_accounts).

Read/update/archive only — deliberately NO hard delete: bookings and
instalments reference user_id, so true erasure (GDPR) must be an anonymisation
routine run deliberately, never a dashboard button. Deactivation blocks login;
archive hides the row from the default list.

Mounted under /api/admin and guarded by the same session auth as the rest.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, UserAccount
from ..utils.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin-customers"])


class CustomerResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: str
    postcode: str
    due_date: str
    is_active: bool
    bookings_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    is_deleted: bool = False


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=32)
    postcode: Optional[str] = Field(default=None, max_length=16)
    due_date: Optional[str] = Field(default=None, max_length=32)
    is_active: Optional[bool] = None


def _serialise(row: UserAccount, bookings_count: int = 0) -> dict:
    return {
        "id": row.id,
        "email": row.email,
        "name": row.name,
        "phone": row.phone,
        "postcode": row.postcode,
        "due_date": row.due_date,
        "is_active": row.is_active,
        "bookings_count": bookings_count,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "is_deleted": row.is_deleted,
    }


def _booking_counts(db: Session, user_ids: List[int]) -> Dict[int, int]:
    """Map user_id → count of their non-deleted bookings (batched)."""
    if not user_ids:
        return {}
    rows = (
        db.query(Booking.user_id, func.count(Booking.id))
        .filter(
            Booking.user_id.in_(user_ids),
            Booking.is_deleted == False,  # noqa: E712
        )
        .group_by(Booking.user_id)
        .all()
    )
    return {uid: int(count) for uid, count in rows}


@router.get("/customers")
def list_customers(
    page: int = 1,
    per_page: int = 20,
    q: str = "",
    include_deleted: bool = False,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Paginated, searchable customer list with booking counts."""
    page = max(1, page)
    per_page = min(max(1, per_page), 100)

    query = db.query(UserAccount)
    if not include_deleted:
        query = query.filter(UserAccount.is_deleted == False)  # noqa: E712
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                UserAccount.name.ilike(like),
                UserAccount.email.ilike(like),
                UserAccount.postcode.ilike(like),
            )
        )

    total = query.count()
    rows = (
        query.order_by(UserAccount.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    counts = _booking_counts(db, [r.id for r in rows])
    return {
        "items": [_serialise(r, counts.get(r.id, 0)) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/customers/export")
def export_customers(
    include_deleted: bool = False,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """CSV of all customers (optionally including archived)."""
    query = db.query(UserAccount)
    if not include_deleted:
        query = query.filter(UserAccount.is_deleted == False)  # noqa: E712
    rows = query.order_by(UserAccount.created_at.desc()).all()
    counts = _booking_counts(db, [r.id for r in rows])

    headers = [
        "id", "email", "name", "phone", "postcode", "due_date",
        "is_active", "bookings_count", "created_at",
    ]
    lines = [",".join(headers)]
    for row in rows:
        data = _serialise(row, counts.get(row.id, 0))
        values = []
        for h in headers:
            raw = data.get(h, "")
            value = "" if raw is None else str(raw)
            if "," in value or '"' in value or "\n" in value:
                value = '"' + value.replace('"', '""') + '"'
            values.append(value)
        lines.append(",".join(values))
    return PlainTextResponse(
        content="\n".join(lines),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="customers-export.csv"'},
    )


@router.get("/customers/{customer_id}")
def get_customer(
    customer_id: int,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Customer detail with their booking history (for support context)."""
    row = db.get(UserAccount, customer_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    bookings = (
        db.query(Booking)
        .filter(
            Booking.user_id == customer_id,
            Booking.is_deleted == False,  # noqa: E712
        )
        .order_by(Booking.created_at.desc())
        .all()
    )
    return {
        **_serialise(row, len(bookings)),
        "bookings": [
            {
                "id": b.id,
                "reference": b.reference,
                "package_name": b.package_name,
                "status": b.status,
                "amount_paid_pence": b.amount_paid_pence,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
            for b in bookings
        ],
    }


@router.patch("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Edit customer details and/or deactivate the account (blocks login)."""
    row = db.get(UserAccount, customer_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    data = payload.model_dump(exclude_unset=True)
    for field in ("name", "phone", "postcode", "due_date"):
        if field in data and data[field] is not None:
            value = data[field]
            setattr(row, field, value.strip() if isinstance(value, str) else value)
    if "is_active" in data:
        row.is_active = data["is_active"]

    db.commit()
    db.refresh(row)
    counts = _booking_counts(db, [row.id])
    return _serialise(row, counts.get(row.id, 0))


@router.patch("/customers/{customer_id}/archive")
def archive_customer(
    customer_id: int,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete a customer (hides from list; bookings are untouched)."""
    row = db.get(UserAccount, customer_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    row.is_deleted = True
    db.commit()
    db.refresh(row)
    return _serialise(row)


@router.patch("/customers/{customer_id}/restore")
def restore_customer(
    customer_id: int,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.get(UserAccount, customer_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    row.is_deleted = False
    db.commit()
    db.refresh(row)
    return _serialise(row)

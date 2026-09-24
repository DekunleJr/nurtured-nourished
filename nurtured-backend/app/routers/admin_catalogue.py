"""Admin CRUD for packages, cohorts and bookings.

Mounted under /api/admin and guarded by the same session auth as the
submissions endpoints (get_current_admin).
"""
from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Cohort, ProgrammePackage
from ..utils.auth import get_current_admin
from .catalogue import ACTIVE_BOOKING_STATUSES, seats_taken_count

router = APIRouter(prefix="/api/admin", tags=["admin-catalogue"])

CohortStatus = Literal["open", "closing_soon", "closed"]
BookingStatus = Literal["pending_payment", "part_paid", "paid", "confirmed", "cancelled"]


# --- Request schemas ---
class PackageUpsert(BaseModel):
    slug: str = Field(..., min_length=1, max_length=64, pattern=r"^[a-z0-9-]+$")
    name: str = Field(..., min_length=1, max_length=255)
    tagline: str = Field(default="", max_length=255)
    price_pence: int = Field(default=0, ge=0)
    currency: str = Field(default="gbp", max_length=8)
    blurb: str = Field(default="", max_length=2000)
    features: List[str] = Field(default_factory=list)
    price_note: str = Field(default="", max_length=255)
    cta_label: str = Field(default="Book your place", max_length=64)
    is_featured: bool = False
    is_published: bool = True
    sort_order: int = Field(default=0, ge=0)


class CohortUpsert(BaseModel):
    label: str = Field(..., min_length=1, max_length=255)
    start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    duration_weeks: int = Field(default=6, ge=1, le=52)
    session_time: str = Field(default="", max_length=64)
    capacity: int = Field(default=5, ge=1, le=100)
    status: CohortStatus = "open"
    notes: str = Field(default="", max_length=2000)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingUpdate(BaseModel):
    """Admin edit of a booking's customer/cohort/package details.

    All fields optional so the UI can PATCH only what changed. Moving to a
    different package re-snapshots name/price (same rule as public checkout);
    moving cohort is seat-checked by the handler.
    """

    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    email: Optional[str] = Field(default=None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=255)
    due_date: Optional[str] = Field(default=None, max_length=32)
    postcode: Optional[str] = Field(default=None, max_length=16)
    partner_name: Optional[str] = Field(default=None, max_length=255)
    cohort_id: Optional[int] = Field(default=None, ge=1)
    package_id: Optional[int] = Field(default=None, ge=1)


class BookingCreate(BaseModel):
    """Manual/offline booking created by the admin (bank transfer, phone, etc.).

    Mirrors the public flow's snapshot rules: package name/price are copied at
    creation so later package edits never rewrite history. `status` defaults to
    `confirmed` because an admin creating a row has already taken the money (or
    is recording a comp/place-holder); `pending_payment` is available when they
    are merely reserving.
    """

    package_id: int = Field(..., ge=1)
    cohort_id: Optional[int] = Field(default=None, ge=1)
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=255)
    due_date: str = Field(default="", max_length=32)
    postcode: str = Field(default="", max_length=16)
    partner_name: str = Field(default="", max_length=255)
    status: BookingStatus = "confirmed"


def _serialise_package(pkg: ProgrammePackage) -> dict:
    return {
        "id": pkg.id,
        "slug": pkg.slug,
        "name": pkg.name,
        "tagline": pkg.tagline,
        "price_pence": pkg.price_pence,
        "currency": pkg.currency,
        "blurb": pkg.blurb,
        "features": pkg.features or [],
        "price_note": pkg.price_note,
        "cta_label": pkg.cta_label,
        "is_featured": pkg.is_featured,
        "is_published": pkg.is_published,
        "sort_order": pkg.sort_order,
        "created_at": pkg.created_at.isoformat() if pkg.created_at else None,
        "updated_at": pkg.updated_at.isoformat() if pkg.updated_at else None,
        "is_deleted": pkg.is_deleted,
    }


# --- Packages CRUD ---
@router.get("/packages")
def list_packages_admin(
    include_deleted: bool = False,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(ProgrammePackage)
    if not include_deleted:
        query = query.filter(ProgrammePackage.is_deleted == False)  # noqa: E712
    rows = query.order_by(ProgrammePackage.sort_order.asc(), ProgrammePackage.id.asc()).all()
    return {"items": [_serialise_package(p) for p in rows], "total": len(rows)}


@router.post("/packages", status_code=201)
def create_package(
    payload: PackageUpsert,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if db.query(ProgrammePackage).filter(ProgrammePackage.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="A package with this slug already exists")
    pkg = ProgrammePackage(**payload.model_dump())
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return _serialise_package(pkg)


@router.put("/packages/{package_id}")
def update_package(
    package_id: int,
    payload: PackageUpsert,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    pkg = db.get(ProgrammePackage, package_id)
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    clash = (
        db.query(ProgrammePackage)
        .filter(
            ProgrammePackage.slug == payload.slug,
            ProgrammePackage.id != package_id,
        )
        .first()
    )
    if clash:
        raise HTTPException(status_code=409, detail="A package with this slug already exists")
    for key, value in payload.model_dump().items():
        setattr(pkg, key, value)
    db.commit()
    db.refresh(pkg)
    return _serialise_package(pkg)


@router.patch("/packages/{package_id}/archive")
def archive_package(
    package_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    pkg = db.get(ProgrammePackage, package_id)
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    pkg.is_deleted = True
    db.commit()
    return _serialise_package(pkg)


@router.patch("/packages/{package_id}/restore")
def restore_package(
    package_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    pkg = db.get(ProgrammePackage, package_id)
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    pkg.is_deleted = False
    db.commit()
    return _serialise_package(pkg)


def _serialise_cohort(cohort: Cohort, db: Session) -> dict:
    return {
        "id": cohort.id,
        "label": cohort.label,
        "start_date": cohort.start_date.isoformat() if cohort.start_date else None,
        # end_date is derived (start + duration) and is the date checkout
        # compares against a customer's due date — expose it so the admin UI
        # can show and validate the same rule.
        "end_date": cohort.end_date.isoformat() if cohort.start_date else None,
        "duration_weeks": cohort.duration_weeks,
        "session_time": cohort.session_time,
        "capacity": cohort.capacity,
        "status": cohort.status,
        "notes": cohort.notes,
        "seats_taken": seats_taken_count(db, cohort.id),
        "created_at": cohort.created_at.isoformat() if cohort.created_at else None,
        "updated_at": cohort.updated_at.isoformat() if cohort.updated_at else None,
        "is_deleted": cohort.is_deleted,
    }


# --- Cohorts CRUD ---
@router.get("/cohorts")
def list_cohorts_admin(
    include_deleted: bool = False,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Cohort)
    if not include_deleted:
        query = query.filter(Cohort.is_deleted == False)  # noqa: E712
    rows = query.order_by(Cohort.start_date.asc(), Cohort.id.asc()).all()
    return {"items": [_serialise_cohort(c, db) for c in rows], "total": len(rows)}


@router.post("/cohorts", status_code=201)
def create_cohort(
    payload: CohortUpsert,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    cohort = Cohort(
        label=payload.label,
        start_date=date.fromisoformat(payload.start_date),
        duration_weeks=payload.duration_weeks,
        session_time=payload.session_time,
        capacity=payload.capacity,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(cohort)
    db.commit()
    db.refresh(cohort)
    return _serialise_cohort(cohort, db)


@router.put("/cohorts/{cohort_id}")
def update_cohort(
    cohort_id: int,
    payload: CohortUpsert,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    cohort = db.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    cohort.label = payload.label
    cohort.start_date = date.fromisoformat(payload.start_date)
    cohort.duration_weeks = payload.duration_weeks
    cohort.session_time = payload.session_time
    cohort.capacity = payload.capacity
    cohort.status = payload.status
    cohort.notes = payload.notes
    db.commit()
    db.refresh(cohort)
    return _serialise_cohort(cohort, db)


@router.patch("/cohorts/{cohort_id}/archive")
def archive_cohort(
    cohort_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    cohort = db.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    cohort.is_deleted = True
    db.commit()
    return _serialise_cohort(cohort, db)


@router.patch("/cohorts/{cohort_id}/restore")
def restore_cohort(
    cohort_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    cohort = db.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    cohort.is_deleted = False
    db.commit()
    return _serialise_cohort(cohort, db)


def _serialise_booking(booking: Booking) -> dict:
    return {
        "id": booking.id,
        "reference": booking.reference,
        "cohort_id": booking.cohort_id,
        "package_id": booking.package_id,
        "package_name": booking.package_name,
        "package_price_pence": booking.package_price_pence,
        "package_currency": booking.package_currency,
        "name": booking.name,
        "email": booking.email,
        "due_date": booking.due_date,
        "postcode": booking.postcode,
        "partner_name": booking.partner_name,
        "payment_plan": booking.payment_plan,
        "instalments_total": booking.instalments_total,
        "amount_paid_pence": booking.amount_paid_pence,
        "status": booking.status,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
        "updated_at": booking.updated_at.isoformat() if booking.updated_at else None,
        "is_deleted": booking.is_deleted,
    }


# --- Bookings (list / status / archive) ---
@router.get("/bookings")
def list_bookings_admin(
    page: int = 1,
    per_page: int = 20,
    q: str = "",
    status: Optional[BookingStatus] = None,
    include_deleted: bool = False,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    page = max(1, page)
    per_page = min(max(1, per_page), 100)
    query = db.query(Booking)
    if not include_deleted:
        query = query.filter(Booking.is_deleted == False)  # noqa: E712
    if status:
        query = query.filter(Booking.status == status)
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Booking.name.ilike(like),
                Booking.email.ilike(like),
                Booking.reference.ilike(like),
                Booking.package_name.ilike(like),
            )
        )
    total = query.count()
    rows = (
        query.order_by(Booking.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {
        "items": [_serialise_booking(b) for b in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/bookings/export")
def export_bookings(
    include_deleted: bool = False,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Booking)
    if not include_deleted:
        query = query.filter(Booking.is_deleted == False)  # noqa: E712
    headers = [
        "reference",
        "status",
        "package_name",
        "package_price_pence",
        "name",
        "email",
        "due_date",
        "postcode",
        "partner_name",
        "created_at",
    ]
    lines = [",".join(headers)]
    for row in query.order_by(Booking.created_at.desc()).all():
        data = _serialise_booking(row)
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
        headers={"Content-Disposition": 'attachment; filename="bookings-export.csv"'},
    )


@router.patch("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Manually move a booking between statuses (e.g. mark paid after a bank
    transfer, or cancel a place and free the seat)."""
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = payload.status
    db.commit()
    db.refresh(booking)
    return _serialise_booking(booking)


def _assert_cohort_has_seat(db: Session, cohort_id: int, moving_booking_id: int | None = None) -> Cohort:
    """Fetch an assignable cohort and ensure it is not full.

    `moving_booking_id` excludes the booking being edited from the seat count,
    so re-saving a booking on its own cohort never trips the capacity guard.
    """
    cohort = db.get(Cohort, cohort_id)
    if cohort is None or cohort.is_deleted:
        raise HTTPException(status_code=404, detail="Cohort not found")
    taken = seats_taken_count(db, cohort.id)
    if moving_booking_id is not None:
        current = (
            db.query(Booking)
            .filter(
                Booking.id == moving_booking_id,
                Booking.cohort_id == cohort_id,
                Booking.is_deleted == False,  # noqa: E712
                Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            )
            .first()
        )
        if current is not None:
            taken -= 1  # the seat it already holds counts as its own
    if taken >= cohort.capacity:
        raise HTTPException(status_code=409, detail="This cohort is fully booked")
    return cohort


@router.put("/bookings/{booking_id}")
def update_booking(
    booking_id: int,
    payload: BookingUpdate,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Edit a booking's details: customer info, cohort move, package swap.

    Guards: target cohort must exist and have a free seat (excluding this
    booking's own hold); swapping the package re-snapshots name/price so the
    receipt always matches what was charged.
    """
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    data = payload.model_dump(exclude_unset=True)

    if "cohort_id" in data and data["cohort_id"] != booking.cohort_id:
        if data["cohort_id"] is not None:
            _assert_cohort_has_seat(db, data["cohort_id"], moving_booking_id=booking.id)
        booking.cohort_id = data["cohort_id"]

    if "package_id" in data and data["package_id"] != booking.package_id:
        package = (
            db.query(ProgrammePackage)
            .filter(
                ProgrammePackage.id == data["package_id"],
                ProgrammePackage.is_deleted == False,  # noqa: E712
            )
            .one_or_none()
        )
        if package is None:
            raise HTTPException(status_code=404, detail="Package not found")
        booking.package_id = package.id
        booking.package_name = package.name
        booking.package_price_pence = package.price_pence
        booking.package_currency = package.currency

    for field in ("name", "email", "due_date", "postcode", "partner_name"):
        if field in data and data[field] is not None:
            setattr(booking, field, data[field].strip() if isinstance(data[field], str) else data[field])

    db.commit()
    db.refresh(booking)
    return _serialise_booking(booking)


@router.post("/bookings", status_code=201)
def create_booking_admin(
    payload: BookingCreate,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a booking manually (offline payment, phone booking, comp place).

    Uses the same reference generator and seat-capacity guard as the public
    flow so an admin can never oversell a cohort either.
    """
    package = (
        db.query(ProgrammePackage)
        .filter(
            ProgrammePackage.id == payload.package_id,
            ProgrammePackage.is_deleted == False,  # noqa: E712
        )
        .one_or_none()
    )
    if package is None:
        raise HTTPException(status_code=404, detail="Package not found")

    if payload.cohort_id is not None:
        _assert_cohort_has_seat(db, payload.cohort_id)

    # Same short URL-safe reference scheme as the public checkout flow.
    from .bookings import _reference

    booking = Booking(
        reference=_reference(),
        cohort_id=payload.cohort_id,
        package_id=package.id,
        package_name=package.name,
        package_price_pence=package.price_pence,
        package_currency=package.currency,
        name=payload.name.strip(),
        email=payload.email.strip().lower(),
        due_date=payload.due_date,
        postcode=payload.postcode,
        partner_name=payload.partner_name,
        status=payload.status,
        # A manually created booking is settled offline: mark it fully paid
        # unless it is deliberately left pending (admin is only reserving).
        instalments_total=1,
        amount_paid_pence=(
            0 if payload.status == "pending_payment" else package.price_pence
        ),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _serialise_booking(booking)


@router.patch("/bookings/{booking_id}/archive")
def archive_booking(
    booking_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.is_deleted = True
    db.commit()
    return _serialise_booking(booking)


@router.patch("/bookings/{booking_id}/restore")
def restore_booking(
    booking_id: int,
    _admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.is_deleted = False
    db.commit()
    return _serialise_booking(booking)
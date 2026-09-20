"""Public catalogue endpoints: published packages and open cohorts.

These power the /packages page and the /booking flow. The frontend falls back
to static content when this API is unreachable, so these handlers stay small
and read-only.
"""
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Cohort, ProgrammePackage

router = APIRouter(prefix="/api", tags=["catalogue"])

# Booking statuses that occupy a seat on a cohort. `part_paid` counts because a
# deposit secures the place even while later instalments are outstanding.
ACTIVE_BOOKING_STATUSES = ("pending_payment", "part_paid", "paid", "confirmed")


def serialise_package(pkg: ProgrammePackage) -> dict:
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
    }


def serialise_cohort(cohort: Cohort, seats_taken: int) -> dict:
    return {
        "id": cohort.id,
        "label": cohort.label,
        "start_date": cohort.start_date.isoformat() if cohort.start_date else None,
        "session_time": cohort.session_time,
        "capacity": cohort.capacity,
        "status": cohort.status,
        "seats_taken": seats_taken,
        "seats_left": max(0, cohort.capacity - seats_taken),
    }


def seats_taken_count(db: Session, cohort_id: int) -> int:
    """Count bookings currently holding a seat on the given cohort."""
    return (
        db.query(func.count(Booking.id))
        .filter(
            Booking.cohort_id == cohort_id,
            Booking.is_deleted == False,  # noqa: E712
            Booking.status.in_(ACTIVE_BOOKING_STATUSES),
        )
        .scalar()
        or 0
    )


@router.get("/packages")
def list_packages(db: Session = Depends(get_db)):
    rows = (
        db.query(ProgrammePackage)
        .filter(
            ProgrammePackage.is_published == True,  # noqa: E712
            ProgrammePackage.is_deleted == False,  # noqa: E712
        )
        .order_by(ProgrammePackage.sort_order.asc(), ProgrammePackage.id.asc())
        .all()
    )
    return {"items": [serialise_package(p) for p in rows]}


@router.get("/cohorts")
def list_cohorts(package_id: int | None = None, db: Session = Depends(get_db)):
    """List cohorts with available places, soonest first.

    Cohorts that are full, closed, archived, or already started are excluded.
    `package_id` is accepted for future per-package cohorts; today a cohort is
    a run of the whole programme, so all cohorts are returned.
    """
    rows = (
        db.query(Cohort)
        .filter(
            Cohort.is_deleted == False,  # noqa: E712
            Cohort.status != "closed",
            Cohort.start_date >= date.today(),
        )
        .order_by(Cohort.start_date.asc())
        .all()
    )

    items = []
    for cohort in rows:
        taken = seats_taken_count(db, cohort.id)
        if taken >= cohort.capacity:
            continue  # full — hide from the public list
        items.append(serialise_cohort(cohort, taken))

    return {"items": items}
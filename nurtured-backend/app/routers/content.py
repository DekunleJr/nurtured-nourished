"""Testimonials and newsletter: public reads/signups + admin CRUD.

Public endpoints:
  GET  /api/testimonials  → published testimonials (homepage, /testimonials)
  POST /api/newsletter     → capture a signup (rate-limited, idempotent)

Admin endpoints (mounted under /api/admin, session-guarded):
  GET/POST /api/admin/testimonials, PUT /{id}, PATCH /{id}/archive|restore
  GET /api/admin/newsletter (+ /export CSV), PATCH /{id}/archive|restore

The admin router MUST be included BEFORE the generic admin router in
app/main.py (see the ORDER MATTERS comment there).
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import NewsletterSubscriber, Testimonial
from ..rate_limit import limiter
from ..utils.auth import get_current_admin

public_router = APIRouter(prefix="/api", tags=["content"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-content"])

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
_EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class TestimonialUpsert(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(default="", max_length=255)
    package: str = Field(default="", max_length=255)
    quote: str = Field(..., min_length=1, max_length=4000)
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = Field(default=0, ge=0)


class NewsletterSubscribe(BaseModel):
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    source: str = Field(default="site", max_length=64)


def _serialise_testimonial(row: Testimonial) -> dict:
    return {
        "id": row.id,
        "name": row.name,
        "location": row.location,
        "package": row.package,
        "quote": row.quote,
        "is_featured": row.is_featured,
        "is_published": row.is_published,
        "sort_order": row.sort_order,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "is_deleted": row.is_deleted,
    }


def _serialise_subscriber(row: NewsletterSubscriber) -> dict:
    return {
        "id": row.id,
        "email": row.email,
        "source": row.source,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "is_deleted": row.is_deleted,
    }


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------
@public_router.get("/testimonials")
def list_published_testimonials(db: Session = Depends(get_db)):
    """Published, non-deleted testimonials: featured first, then sort_order."""
    rows = (
        db.query(Testimonial)
        .filter(
            Testimonial.is_published == True,  # noqa: E712
            Testimonial.is_deleted == False,  # noqa: E712
        )
        .order_by(
            Testimonial.is_featured.desc(),
            Testimonial.sort_order.asc(),
            Testimonial.id.asc(),
        )
        .all()
    )
    return {
        "items": [
            {
                "id": r.id,
                "name": r.name,
                "location": r.location,
                "package": r.package,
                "quote": r.quote,
                "is_featured": r.is_featured,
                "sort_order": r.sort_order,
            }
            for r in rows
        ]
    }


@public_router.post("/newsletter", status_code=201)
@limiter.limit("5/minute")
def subscribe_newsletter(
    request: Request,
    payload: NewsletterSubscribe,
    db: Session = Depends(get_db),
):
    """Capture a newsletter signup.

    Idempotent by design: resubmitting (or submitting the address that is
    already archived) simply reports success — a signup form must never leak
    whether an address is on the list.
    """
    email = payload.email.strip().lower()
    existing = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.email == email)
        .first()
    )
    if existing is not None:
        existing.is_deleted = False  # re-subscribing un-archives
        db.commit()
        return {"message": "You're subscribed. Thank you!"}

    db.add(NewsletterSubscriber(email=email, source=payload.source))
    db.commit()
    return {"message": "You're subscribed. Thank you!"}


# ---------------------------------------------------------------------------
# Admin: testimonials CRUD
# ---------------------------------------------------------------------------
@admin_router.get("/testimonials")
def list_testimonials_admin(
    include_deleted: bool = False,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Testimonial)
    if not include_deleted:
        query = query.filter(Testimonial.is_deleted == False)  # noqa: E712
    rows = query.order_by(
        Testimonial.sort_order.asc(), Testimonial.id.asc()
    ).all()
    return {
        "items": [_serialise_testimonial(r) for r in rows],
        "total": len(rows),
    }


@admin_router.post("/testimonials", status_code=201)
def create_testimonial(
    payload: TestimonialUpsert,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = Testimonial(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return _serialise_testimonial(row)


@admin_router.put("/testimonials/{testimonial_id}")
def update_testimonial(
    testimonial_id: int,
    payload: TestimonialUpsert,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.get(Testimonial, testimonial_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return _serialise_testimonial(row)


@admin_router.patch("/testimonials/{testimonial_id}/archive")
def archive_testimonial(
    testimonial_id: int,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.get(Testimonial, testimonial_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    row.is_deleted = True
    db.commit()
    db.refresh(row)
    return _serialise_testimonial(row)


@admin_router.patch("/testimonials/{testimonial_id}/restore")
def restore_testimonial(
    testimonial_id: int,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.get(Testimonial, testimonial_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    row.is_deleted = False
    db.commit()
    db.refresh(row)
    return _serialise_testimonial(row)


# ---------------------------------------------------------------------------
# Admin: newsletter subscribers (list / export / remove)
# ---------------------------------------------------------------------------
@admin_router.get("/newsletter")
def list_subscribers(
    include_deleted: bool = False,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(NewsletterSubscriber)
    if not include_deleted:
        query = query.filter(NewsletterSubscriber.is_deleted == False)  # noqa: E712
    rows = query.order_by(NewsletterSubscriber.created_at.desc()).all()
    return {
        "items": [_serialise_subscriber(r) for r in rows],
        "total": len(rows),
    }


@admin_router.get("/newsletter/export")
def export_subscribers(
    include_deleted: bool = False,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(NewsletterSubscriber)
    if not include_deleted:
        query = query.filter(NewsletterSubscriber.is_deleted == False)  # noqa: E712
    rows = query.order_by(NewsletterSubscriber.created_at.desc()).all()
    lines = ["id,email,source,created_at"]
    for r in rows:
        values = [str(r.id), r.email, r.source, r.created_at.isoformat() if r.created_at else ""]
        if any("," in v or '"' in v for v in values):
            values = ['"' + v.replace('"', '""') + '"' for v in values]
        lines.append(",".join(values))
    return PlainTextResponse(
        content="\n".join(lines),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"'
        },
    )


@admin_router.patch("/newsletter/{subscriber_id}/archive")
def archive_subscriber(
    subscriber_id: int,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Remove/unsubscribe a subscriber (soft — keeps a suppression record)."""
    row = db.get(NewsletterSubscriber, subscriber_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    row.is_deleted = True
    db.commit()
    db.refresh(row)
    return _serialise_subscriber(row)


@admin_router.patch("/newsletter/{subscriber_id}/restore")
def restore_subscriber(
    subscriber_id: int,
    _admin: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    row = db.get(NewsletterSubscriber, subscriber_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    row.is_deleted = False
    db.commit()
    db.refresh(row)
    return _serialise_subscriber(row)

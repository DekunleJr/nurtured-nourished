"""The customer purchase flow: cohorts filtered by due date, then a payment plan.

GET  /api/me/cohorts                                    cohorts that finish before the due date
POST /api/me/checkout                                   reserve a place, create the instalment schedule
GET  /api/me/bookings                                   the customer's purchases
GET  /api/me/bookings/{reference}                       one purchase with its schedule
POST /api/me/bookings/{reference}/instalments/{n}/pay   Stripe Checkout for the next instalment
POST /api/me/bookings/{reference}/sync                  reconcile a payment with Stripe directly

Every route requires a *customer* session (role "user" — see get_current_user), so
an admin token cannot buy on someone else's behalf by accident, and one customer
can never read another's booking.

The eligibility rules and the money maths live in app.utils.payment_plans; this
module only fetches, validates and persists.
"""

import logging
import uuid
from datetime import date, datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..config import PUBLIC_SITE_URL, STRIPE_ENABLED, STRIPE_SECRET_KEY
from ..database import get_db
from ..models import Booking, Cohort, Instalment, ProgrammePackage, UserAccount
from ..utils.auth import get_current_user
from ..utils.instalments import (
    BOOKING_PENDING_PAYMENT,
    next_unpaid_instalment,
    ordered_instalments,
    record_instalment_paid,
    serialise_instalment,
)
from ..utils.payment_plans import category_for, find_plan, parse_due_date, plan_options
from .catalogue import seats_taken_count

logger = logging.getLogger("nurture.checkout")

router = APIRouter(prefix="/api/me", tags=["checkout"])

# Statuses that describe a live purchase (a cancelled booking is not one).
_LIVE_BOOKING_STATUSES = ("pending_payment", "part_paid", "paid", "confirmed")


def _reference() -> str:
    """Short, URL-safe public booking reference."""
    return uuid.uuid4().hex[:12].upper()


def _current_user(db: Session, session: dict) -> UserAccount:
    """The UserAccount behind the session cookie."""
    user = (
        db.query(UserAccount)
        .filter(
            UserAccount.id == int(session["sub"]),
            UserAccount.is_deleted == False,  # noqa: E712
            UserAccount.is_active == True,  # noqa: E712
        )
        .one_or_none()
    )
    if user is None:
        raise HTTPException(status_code=401, detail="Account not found")
    return user


def _published_package(db: Session, package_id: int) -> ProgrammePackage:
    package = (
        db.query(ProgrammePackage)
        .filter(
            ProgrammePackage.id == package_id,
            ProgrammePackage.is_published == True,  # noqa: E712
            ProgrammePackage.is_deleted == False,  # noqa: E712
        )
        .one_or_none()
    )
    if package is None:
        raise HTTPException(status_code=404, detail="Package not found")
    return package


def _serialise_plan(plan) -> dict:
    """A plan as the checkout UI needs it — amounts, percentages and dates."""
    return {
        "code": plan.code,
        "label": plan.label,
        "total_pence": plan.total_pence,
        "deposit_pence": plan.deposit_pence,
                "is_instalment_plan": plan.is_instalment_plan,
        # Drives the "your balance must be settled before the cohort starts"
        # warning shown on every multi-instalment option.
        "requires_payment_before_start": plan.is_instalment_plan,
        "amounts_pence": plan.amounts_pence,
        "summary": plan.summary,
        "instalments": [
            {
                "sequence": spec.sequence,
                "amount_pence": spec.amount_pence,
                "percentage": spec.percentage,
                "due_date": spec.due_date.isoformat(),
            }
            for spec in plan.instalments
        ],
    }


def _serialise_booking(booking: Booking, cohort: Cohort | None, instalments) -> dict:
    schedule = ordered_instalments(instalments)
    nxt = next_unpaid_instalment(schedule)
    return {
        "reference": booking.reference,
        "status": booking.status,
        "package_id": booking.package_id,
        "package_name": booking.package_name,
        "package_price_pence": booking.package_price_pence,
        "package_currency": booking.package_currency,
        "amount_paid_pence": booking.amount_paid_pence,
        "payment_plan": booking.payment_plan,
        "instalments_total": booking.instalments_total,
        "cohort": (
            {
                "id": cohort.id,
                "label": cohort.label,
                "start_date": cohort.start_date.isoformat(),
                "end_date": cohort.end_date.isoformat(),
                "session_time": cohort.session_time,
            }
            if cohort is not None
            else None
        ),
        "instalments": [serialise_instalment(i) for i in schedule],
        "next_instalment": serialise_instalment(nxt) if nxt else None,
        "payment_enabled": STRIPE_ENABLED,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
    }


@router.get("/cohorts")
def list_eligible_cohorts(
    package_id: int,
    session: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cohorts this customer may join, each with the plans they may choose.

    Only cohorts that **finish before the baby is due** are returned, together
    with the payment options for how far away that cohort is. Returning the plans
    here (rather than letting the UI compute them) keeps one authority for the
    rule, so the screen can never disagree with what is charged.
    """
    user = _current_user(db, session)
    due = parse_due_date(user.due_date)
    if due is None:
        raise HTTPException(
            status_code=409,
            detail="Add your estimated due date to your account before choosing a cohort",
        )

    package = _published_package(db, package_id)
    today = date.today()

    rows = (
        db.query(Cohort)
        .filter(
            Cohort.is_deleted == False,  # noqa: E712
            Cohort.status != "closed",
            Cohort.start_date >= today,
        )
        .order_by(Cohort.start_date.asc())
        .all()
    )

    items = []
    for cohort in rows:
        if cohort.end_date > due:
            continue  # the programme would still be running when the baby is due
        taken = seats_taken_count(db, cohort.id)
        if taken >= cohort.capacity:
            continue  # full — nothing to offer
        days_to_start = (cohort.start_date - today).days
        items.append(
            {
                "id": cohort.id,
                "label": cohort.label,
                "start_date": cohort.start_date.isoformat(),
                "end_date": cohort.end_date.isoformat(),
                "duration_weeks": cohort.duration_weeks,
                "session_time": cohort.session_time,
                "seats_taken": taken,
                "seats_left": max(0, cohort.capacity - taken),
                "status": cohort.status,
                "days_to_start": days_to_start,
                "weeks_to_start": days_to_start // 7,
                "category": category_for(days_to_start),
                "plans": [
                    _serialise_plan(plan)
                    for plan in plan_options(package.price_pence, cohort.start_date, today)
                ],
            }
        )

    return {
        "due_date": user.due_date,
        "package": {
            "id": package.id,
            "slug": package.slug,
            "name": package.name,
            "price_pence": package.price_pence,
            "currency": package.currency,
            "price_note": package.price_note,
        },
        "items": items,
    }


class CheckoutRequest(BaseModel):
    """Reserve a place: which cohort, on which payment plan."""

    cohort_id: int = Field(..., ge=1)
    package_id: int = Field(..., ge=1)
    plan_code: str = Field(default="full", min_length=1, max_length=16)


def _checkout_session(booking, instalment, customer, schedule):
    """Create the Stripe Checkout session that collects one instalment."""
    total = len(schedule)
    line = f"{booking.package_name} - payment {instalment.sequence} of {total}"
    return stripe.checkout.Session.create(
        mode="payment",
        customer_email=customer.email,
        line_items=[
            {
                "price_data": {
                    "currency": booking.package_currency or "gbp",
                    "unit_amount": instalment.amount_pence,
                    "product_data": {"name": booking.package_name, "description": line},
                },
                "quantity": 1,
            }
        ],
        metadata={
            "booking_reference": booking.reference,
            "instalment_sequence": str(instalment.sequence),
        },
        payment_intent_data={
            "metadata": {
                "booking_reference": booking.reference,
                "instalment_sequence": str(instalment.sequence),
            },
        },
        success_url=f"{PUBLIC_SITE_URL}/my?ref={booking.reference}",
        cancel_url=f"{PUBLIC_SITE_URL}/my?ref={booking.reference}&cancelled=1",
    )


@router.post("/checkout", status_code=201)
def create_checkout(
    payload: CheckoutRequest,
    session: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reserve a place on a cohort and start the deposit payment."""
    user = _current_user(db, session)
    due = parse_due_date(user.due_date)
    if due is None:
        raise HTTPException(
            status_code=409,
            detail="Add your estimated due date before checking out",
        )
    package = _published_package(db, payload.package_id)
    today = date.today()
    cohort = (
        db.query(Cohort)
        .filter(Cohort.id == payload.cohort_id, Cohort.is_deleted == False)  # noqa: E712
        .with_for_update()
        .one_or_none()
    )
    if cohort is None:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if cohort.status == "closed":
        raise HTTPException(status_code=409, detail="This cohort is no longer open")
    if cohort.start_date < today:
        raise HTTPException(status_code=409, detail="This cohort has already started")
    if cohort.end_date > due:
        raise HTTPException(
            status_code=409,
            detail="This programme would still be running when your baby is due",
        )
    plan = find_plan(payload.plan_code, package.price_pence, cohort.start_date, today)
    if plan is None:
        raise HTTPException(
            status_code=409,
            detail="That payment plan is not available for this cohort",
        )
    if seats_taken_count(db, cohort.id) >= cohort.capacity:
        raise HTTPException(status_code=409, detail="This cohort is fully booked")
    try:
        booking = Booking(
            reference=_reference(),
            user_id=user.id,
            cohort_id=cohort.id,
            package_id=package.id,
            package_name=package.name,
            package_price_pence=package.price_pence,
            package_currency=package.currency,
            name=user.name,
            email=user.email,
            due_date=user.due_date,
            postcode=user.postcode,
            payment_plan=plan.code,
            instalments_total=len(plan.instalments),
            amount_paid_pence=0,
            status=BOOKING_PENDING_PAYMENT,
        )
        db.add(booking)
        db.flush()
        schedule = [
            Instalment(
                booking_id=booking.id,
                sequence=spec.sequence,
                amount_pence=spec.amount_pence,
                due_date=spec.due_date,
                status="pending",
            )
            for spec in plan.instalments
        ]
        db.add_all(schedule)
        db.commit()
        db.refresh(booking)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Checkout booking insert failed")
        raise HTTPException(status_code=500, detail="Could not create your booking")
    deposit = next_unpaid_instalment(schedule)
    if not STRIPE_ENABLED or deposit is None:
        out = _serialise_booking(booking, cohort, schedule)
        out["checkout_url"] = None
        return out
    stripe.api_key = STRIPE_SECRET_KEY
    try:
        checkout_session = _checkout_session(booking, deposit, user, schedule)
    except stripe.StripeError:
        logger.exception("Stripe Checkout failed for %s", booking.reference)
        raise HTTPException(
            status_code=502,
            detail="Payment provider unavailable - place reserved, try again later",
        )
    try:
        deposit.stripe_session_id = checkout_session.id
        if not booking.stripe_session_id:
            booking.stripe_session_id = checkout_session.id
        db.commit()
        db.refresh(booking)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Checkout session id persist failed")
    done = _serialise_booking(booking, cohort, schedule)
    done["checkout_url"] = checkout_session.url
    return done

def _owned_booking(db: Session, user_id: int, reference: str) -> Booking:
    """One customer's booking by public reference, or 404.

    Deleted or foreign bookings look exactly like missing ones so nothing leaks.
    """
    booking = (
        db.query(Booking)
        .filter(
            Booking.reference == reference.upper(),
            Booking.user_id == user_id,
            Booking.is_deleted == False,  # noqa: E712
        )
        .one_or_none()
    )
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def _booking_instalments(db: Session, booking: Booking) -> list:
    """The booking's instalment rows, oldest first."""
    return (
        db.query(Instalment)
        .filter(
            Instalment.booking_id == booking.id,
            Instalment.is_deleted == False,  # noqa: E712
        )
        .order_by(Instalment.sequence.asc())
        .all()
    )


def _booking_detail(db: Session, booking: Booking) -> dict:
    cohort = None
    if booking.cohort_id is not None:
        cohort = db.query(Cohort).filter(Cohort.id == booking.cohort_id).one_or_none()
    rows = _booking_instalments(db, booking)
    return _serialise_booking(booking, cohort, rows)


@router.get("/bookings")
def list_my_bookings(
    session: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Every purchase on this account, newest first."""
    user = _current_user(db, session)
    rows = (
        db.query(Booking)
        .filter(
            Booking.user_id == user.id,
            Booking.is_deleted == False,  # noqa: E712
        )
        .order_by(Booking.id.desc())
        .all()
    )
    return {"items": [_booking_detail(db, b) for b in rows]}


@router.get("/bookings/{reference}")
def get_my_booking(
    reference: str,
    session: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """One purchase with its instalment schedule and next amount due."""
    user = _current_user(db, session)
    return _booking_detail(db, _owned_booking(db, user.id, reference))


@router.post("/bookings/{reference}/instalments/{sequence}/pay")
def pay_instalment(
    reference: str,
    sequence: int,
    session: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create the Stripe session that collects one outstanding instalment.

    Instalments settle in order: paying anything other than the next unpaid one
    is refused with 409. An already-created open session is reused so a double
    click never mints a duplicate Stripe session.
    """
    user = _current_user(db, session)
    booking = _owned_booking(db, user.id, reference)
    if booking.status == "cancelled":
        raise HTTPException(status_code=409, detail="This booking was cancelled")
    rows = _booking_instalments(db, booking)
    nxt = next_unpaid_instalment(rows)
    if nxt is None:
        raise HTTPException(status_code=409, detail="This booking is fully paid")
    if nxt.sequence != sequence:
        raise HTTPException(
            status_code=409,
            detail="Instalments are collected in order - pay the next one first",
        )
    if not STRIPE_ENABLED:
        raise HTTPException(status_code=503, detail="Payments are not configured yet")
    if nxt.stripe_session_id:
        try:
            stripe.api_key = STRIPE_SECRET_KEY
            existing = stripe.checkout.Session.retrieve(nxt.stripe_session_id)
            if existing.get("url") and existing.get("status") == "open":
                return {"checkout_url": existing["url"], "sequence": nxt.sequence}
        except stripe.StripeError:
            logger.warning("Stripe session retrieve failed for %s", booking.reference)
    stripe.api_key = STRIPE_SECRET_KEY
    try:
        checkout_session = _checkout_session(booking, nxt, user, rows)
    except stripe.StripeError:
        logger.exception("Stripe instalment session failed for %s", booking.reference)
        raise HTTPException(status_code=502, detail="Payment provider unavailable")
    try:
        nxt.stripe_session_id = checkout_session.id
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Instalment session id persist failed")
    return {"checkout_url": checkout_session.url, "sequence": nxt.sequence}


@router.post("/bookings/{reference}/sync")
def sync_booking(
    reference: str,
    session: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reconcile a booking against Stripe without needing the webhook.

    Local development cannot receive webhooks, so this polls the stored
    Checkout sessions and records any Stripe reports as paid. In production it
    is a harmless no-op once the webhook has run.
    """
    user = _current_user(db, session)
    booking = _owned_booking(db, user.id, reference)
    if not STRIPE_ENABLED:
        return _booking_detail(db, booking)
    rows = _booking_instalments(db, booking)
    stripe.api_key = STRIPE_SECRET_KEY
    for row in rows:
        if row.status == "paid" or not row.stripe_session_id:
            continue
        try:
            remote = stripe.checkout.Session.retrieve(row.stripe_session_id)
        except stripe.StripeError:
            logger.warning("Stripe sync retrieve failed for %s", booking.reference)
            continue
        if remote.get("payment_status") == "paid":
            record_instalment_paid(db, booking, row, row.stripe_session_id)
    return _booking_detail(db, booking)

"""Direct self-serve booking flow with Stripe Checkout (legacy anonymous flow).

POST /api/bookings        → validate capacity, create a pending booking,
                            create a Stripe Checkout session, return its URL.
GET  /api/bookings/{ref}  → public booking status for the confirmation page.
POST /api/payments/webhook → Stripe webhook; marks bookings AND instalments paid.
                             Idempotent: repeat deliveries are no-ops.

The webhook also serves the authenticated /api/me/checkout flow: instalment
sessions created there carry ``instalment_sequence`` metadata, so an event for
one of them is routed to app.utils.instalments.record_instalment_paid instead
of the legacy whole-booking path below.
"""
import logging
import uuid
from datetime import date

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..config import PUBLIC_SITE_URL, STRIPE_ENABLED, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from ..database import get_db
from ..models import Booking, Cohort, Instalment, ProgrammePackage
from ..rate_limit import limiter
from ..schemas import AssignCohortRequest, BookingCreate
from ..utils.instalments import record_instalment_paid
from .catalogue import seats_taken_count

logger = logging.getLogger("nurture.bookings")

router = APIRouter(prefix="/api", tags=["bookings"])


def _reference() -> str:
    """Short, URL-safe public booking reference."""
    return uuid.uuid4().hex[:12].upper()


@router.post("/bookings", status_code=201)
@limiter.limit("5/minute")
def create_booking(
    request: Request,
    payload: BookingCreate,
    db: Session = Depends(get_db),
):
    """Book a place on a programme. A cohort is selected after payment, on the
    /booking/confirmed page."""
    try:
        if payload.cohort_id is not None:
            cohort = (
                db.query(Cohort)
                .filter(
                    Cohort.id == payload.cohort_id,
                    Cohort.is_deleted == False,  # noqa: E712
                )
                .with_for_update()
                .one_or_none()
            )
            if cohort is None:
                raise HTTPException(status_code=404, detail="Cohort not found")
            if cohort.status == "closed":
                raise HTTPException(
                    status_code=409, detail="This cohort is no longer open for booking"
                )
            if cohort.start_date < date.today():
                raise HTTPException(status_code=409, detail="This cohort has already started")
            if seats_taken_count(db, cohort.id) >= cohort.capacity:
                raise HTTPException(status_code=409, detail="This cohort is fully booked")
        else:
            cohort = None

        package = (
            db.query(ProgrammePackage)
            .filter(
                ProgrammePackage.id == payload.package_id,
                ProgrammePackage.is_published == True,  # noqa: E712
                ProgrammePackage.is_deleted == False,  # noqa: E712
            )
            .one_or_none()
        )
        if package is None:
            raise HTTPException(status_code=404, detail="Package not found")

        booking = Booking(
            reference=_reference(),
            cohort_id=payload.cohort_id,
            package_id=package.id,
            package_name=package.name,
            package_price_pence=package.price_pence,
            package_currency=package.currency,
            name=payload.name,
            email=payload.email,
            due_date=payload.due_date,
            postcode=payload.postcode,
            partner_name=payload.partner_name,
            status="pending_payment",
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Booking persistence failed: %s", exc)
        raise HTTPException(status_code=503, detail="Database unavailable") from exc

    checkout_url = None
    if STRIPE_ENABLED:
        try:
            stripe.api_key = STRIPE_SECRET_KEY
            session = stripe.checkout.Session.create(
                mode="payment",
                customer_email=booking.email,
                client_reference_id=booking.reference,
                metadata={"booking_reference": booking.reference},
                line_items=[
                    {
                        "price_data": {
                            "currency": booking.package_currency,
                            "unit_amount": booking.package_price_pence,
                            "product_data": {
                                "name": (
                                f"{booking.package_name}"
                                if cohort is None
                                else f"{booking.package_name} — {cohort.label}"
                            ),
                            },
                        },
                        "quantity": 1,
                    }
                ],
                success_url=f"{PUBLIC_SITE_URL}/booking/confirmed?ref={booking.reference}",
                cancel_url=f"{PUBLIC_SITE_URL}/booking?cancelled=1&ref={booking.reference}",
            )
            booking.stripe_session_id = session.id
            db.commit()
            checkout_url = session.url
        except Exception as exc:  # noqa: BLE001 — Stripe raises its own types
            # The booking stays pending_payment; payment can be retried later.
            logger.error("Stripe checkout creation failed for %s: %s", booking.reference, exc)

    return {
        "reference": booking.reference,
        "status": booking.status,
        "checkout_url": checkout_url,
        "payment_enabled": STRIPE_ENABLED,
    }


@router.patch("/bookings/{reference}/cohort")
def assign_cohort(
    reference: str,
    payload: AssignCohortRequest,
    db: Session = Depends(get_db),
):
    """Assign a cohort to a booking created without one (pay-first flow).

    The cohort is validated for availability at the time of assignment, so the
    seat is only actually held once the cohort is confirmed.
    """
    booking = (
        db.query(Booking)
        .filter(
            Booking.reference == reference.upper(),
            Booking.is_deleted == False,  # noqa: E712
        )
        .one_or_none()
    )
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.cohort_id is not None:
        raise HTTPException(
            status_code=409, detail="A cohort is already assigned to this booking"
        )

    cohort = (
        db.query(Cohort)
        .filter(
            Cohort.id == payload.cohort_id,
            Cohort.is_deleted == False,  # noqa: E712
        )
        .with_for_update()
        .one_or_none()
    )
    if cohort is None:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if cohort.status == "closed":
        raise HTTPException(
            status_code=409, detail="This cohort is no longer open for booking"
        )
    if cohort.start_date < date.today():
        raise HTTPException(status_code=409, detail="This cohort has already started")
    if seats_taken_count(db, cohort.id) >= cohort.capacity:
        raise HTTPException(status_code=409, detail="This cohort is fully booked")

    booking.cohort_id = payload.cohort_id
    db.commit()
    db.refresh(booking)
    return {
        "reference": booking.reference,
        "cohort_id": booking.cohort_id,
        "status": booking.status,
    }



@router.get("/bookings/{reference}")
def booking_status(reference: str, db: Session = Depends(get_db)):
    """Public status lookup for the confirmation page (limited fields only)."""
    booking = (
        db.query(Booking)
        .filter(
            Booking.reference == reference.upper(),
            Booking.is_deleted == False,  # noqa: E712
        )
        .one_or_none()
    )
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {
        "reference": booking.reference,
        "status": booking.status,
        "cohort_id": booking.cohort_id,
        "cohort_label": (
            db.query(Cohort)
            .filter(Cohort.id == booking.cohort_id)
            .scalar()
            if booking.cohort_id is not None
            else None
        ),
        "package_name": booking.package_name,
        "package_price_pence": booking.package_price_pence,
        "package_currency": booking.package_currency,
        "payment_enabled": STRIPE_ENABLED,
    }


@router.post("/payments/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Mark bookings paid on Stripe's checkout.session.completed event.

    Stripe requires the raw body for signature verification.
    """
    if not (STRIPE_ENABLED and STRIPE_WEBHOOK_SECRET):
        raise HTTPException(status_code=503, detail="Payments not configured")

    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, signature, STRIPE_WEBHOOK_SECRET)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid payload") from exc
    except stripe.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid signature") from exc

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        meta = session.get("metadata") or {}
        reference = meta.get("booking_reference", "")
        sequence_raw = (session.get("metadata") or {}).get("instalment_sequence", "")
        booking = (
            db.query(Booking)
            .filter(
                Booking.reference == reference,
                Booking.is_deleted == False,  # noqa: E712
            )
            .one_or_none()
        )
        if booking is None:
            return {"received": True}
        # Instalment payment (authenticated /api/me flow): settle one row and
        # roll the booking to part_paid (or paid for the final instalment).
        # The status filter makes repeat deliveries no-ops.
        if sequence_raw not in ("", None):
            try:
                sequence = int(sequence_raw)
            except (TypeError, ValueError):
                return {"received": True}
            instalment = (
                db.query(Instalment)
                .filter(
                    Instalment.booking_id == booking.id,
                    Instalment.sequence == sequence,
                    Instalment.status != "paid",
                    Instalment.is_deleted == False,  # noqa: E712
                )
                .one_or_none()
            )
            if instalment is not None:
                record_instalment_paid(db, booking, instalment, session.get("id", ""))
                logger.info(
                    "Booking %s instalment %s marked paid via webhook",
                    booking.reference,
                    sequence,
                )
            return {"received": True}
        # Legacy whole-booking payment (anonymous POST /api/bookings flow):
        # only a still-pending booking is promoted, so repeats are no-ops.
        if booking.status != "pending_payment":
            return {"received": True}
        booking.status = "paid"
        if not booking.stripe_session_id:
            booking.stripe_session_id = session.get("id", "")
        db.commit()
        logger.info("Booking %s marked paid via webhook", booking.reference)

    return {"received": True}
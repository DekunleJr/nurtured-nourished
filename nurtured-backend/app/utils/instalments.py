"""Shared instalment bookkeeping.

Used by both the checkout router and the Stripe webhook, so a payment recorded
from the dashboard and one confirmed asynchronously by Stripe always leave the
booking in exactly the same state.

Instalments are settled in order, and a booking only becomes ``paid`` once the
last one clears — anything in between is ``part_paid``, which still holds the
customer's seat (see catalogue.ACTIVE_BOOKING_STATUSES).
"""

from datetime import datetime, timezone
from typing import List, Optional, Sequence

from sqlalchemy.orm import Session

from ..models import Booking, Instalment

STATUS_PENDING = "pending"
STATUS_PAID = "paid"

BOOKING_PENDING_PAYMENT = "pending_payment"
BOOKING_PART_PAID = "part_paid"
BOOKING_PAID = "paid"


def ordered_instalments(instalments: Sequence[Instalment]) -> List[Instalment]:
    """The schedule in payment order."""
    return sorted(
        (i for i in instalments if not i.is_deleted), key=lambda i: i.sequence
    )


def next_unpaid_instalment(instalments: Sequence[Instalment]) -> Optional[Instalment]:
    """The only instalment a customer may pay right now, if any.

    Returning a single instalment (rather than any unpaid one) is what enforces
    paying in order — the caller can simply compare it with the requested
    sequence and refuse anything else.
    """
    for instalment in ordered_instalments(instalments):
        if instalment.status != STATUS_PAID:
            return instalment
    return None


def record_instalment_paid(
    db: Session,
    booking: Booking,
    instalment: Instalment,
    stripe_session_id: str = "",
) -> bool:
    """Mark one instalment settled and roll the booking's totals forward.

    Idempotent: Stripe can deliver the same event more than once, and a customer
    can return to the success page repeatedly. Returns True when this call was the
    one that changed the instalment, False when it had already been paid.
    """
    if instalment.status == STATUS_PAID:
        return False

    instalment.status = STATUS_PAID
    instalment.paid_at = datetime.now(timezone.utc)
    if stripe_session_id and not instalment.stripe_session_id:
        instalment.stripe_session_id = stripe_session_id

    siblings = (
        db.query(Instalment)
        .filter(
            Instalment.booking_id == booking.id,
            Instalment.is_deleted == False,  # noqa: E712
        )
        .all()
    )
    booking.amount_paid_pence = sum(
        i.amount_pence for i in siblings if i.status == STATUS_PAID
    )
    outstanding = [i for i in siblings if i.status != STATUS_PAID]
    booking.status = BOOKING_PAID if not outstanding else BOOKING_PART_PAID
    if stripe_session_id and not booking.stripe_session_id:
        booking.stripe_session_id = stripe_session_id

    db.commit()
    db.refresh(booking)
    return True


def serialise_instalment(instalment: Instalment) -> dict:
    return {
        "sequence": instalment.sequence,
        "amount_pence": instalment.amount_pence,
        "due_date": instalment.due_date.isoformat() if instalment.due_date else None,
        "status": instalment.status,
        "is_paid": instalment.status == STATUS_PAID,
        "is_overdue": instalment.is_overdue,
        "paid_at": instalment.paid_at.isoformat() if instalment.paid_at else None,
    }

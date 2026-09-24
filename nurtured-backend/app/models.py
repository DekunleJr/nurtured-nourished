from datetime import date, datetime, timedelta, timezone

from sqlalchemy import JSON, Boolean, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base, DB_SCHEMA


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Lead(Base):
    """A B2B / commissioning inquiry from the /commissioning page."""

    __tablename__ = "leads"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    organisation: Mapped[str] = mapped_column(String(255))
    contact_name: Mapped[str] = mapped_column(String(255))
    job_title: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    goals: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class DiscoveryIntake(Base):
    """Pre-booking intake captured before a discovery consultation."""

    __tablename__ = "discovery_intake"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    due_date: Mapped[str] = mapped_column(String(32))
    postcode: Mapped[str] = mapped_column(String(16))
    package: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class UserAccount(Base):
    """A customer account — the login used by the purchase/checkout flow.

    `due_date` (YYYY-MM-DD) is what decides which cohorts a customer may join:
    a cohort must finish before the baby is due. A password is always required
    for new accounts; `password_hash` defaults to "" only so pre-existing rows
    created before passwords existed can be migrated safely — a blank hash
    always fails login rather than raising.
    """

    __tablename__ = "user_accounts"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(32), default="")
    postcode: Mapped[str] = mapped_column(String(16), default="")
    due_date: Mapped[str] = mapped_column(String(32), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class ContactMessage(Base):
    """General contact messages from the /contact page."""

    __tablename__ = "contact_messages"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class AdminUser(Base):
    """Back-office admin who can log into the admin dashboard.

    Passwords are stored as bcrypt hashes — never in plaintext. The first
    account is seeded at startup from ADMIN_EMAIL/ADMIN_PASSWORD env vars when
    the table is empty; further admins are managed from the dashboard.
    """

    __tablename__ = "admins"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class ProgrammePackage(Base):
    """A bookable programme tier (e.g. Maternal Foundation), managed by admins.

    The public catalogue only exposes published packages ordered by
    sort_order. `features` is a JSON array of inclusion strings.
    """

    __tablename__ = "packages"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    tagline: Mapped[str] = mapped_column(String(255), default="")
    price_pence: Mapped[int] = mapped_column(default=0)
    currency: Mapped[str] = mapped_column(String(8), default="gbp")
    blurb: Mapped[str] = mapped_column(Text, default="")
    features: Mapped[list] = mapped_column(JSON, default=list)
    price_note: Mapped[str] = mapped_column(String(255), default="")
    cta_label: Mapped[str] = mapped_column(String(64), default="Book your place")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Cohort(Base):
    """A scheduled run of the programme with limited places.

    `capacity` is the total number of paying participants; seats remaining is
    derived by counting active bookings so capacity can never be oversold by a
    stale counter.

    `duration_weeks` is how long the run lasts (six weekly sessions by default).
    `end_date` is derived from it and is what the checkout flow compares against
    a customer's due date, so no duplicate end-date column can drift out of sync.
    """

    __tablename__ = "cohorts"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    label: Mapped[str] = mapped_column(String(255))
    start_date: Mapped[datetime] = mapped_column(Date())
    duration_weeks: Mapped[int] = mapped_column(default=6)
    session_time: Mapped[str] = mapped_column(String(64), default="")
    capacity: Mapped[int] = mapped_column(default=5)
    # open | closing_soon | closed
    status: Mapped[str] = mapped_column(String(16), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    @property
    def end_date(self) -> date:
        """Date of the final session.

        A `duration_weeks`-week programme runs one session a week, so the last
        session lands `duration_weeks - 1` weeks after week 1 begins. That is the
        date that must fall before a participant's due date.
        """
        weeks = self.duration_weeks or 6
        return self.start_date + timedelta(days=(weeks - 1) * 7)


class Booking(Base):
    """A participant's place on a cohort, including payment state.

    `package_name`/`package_price_pence` are snapshotted at booking time so
    later package edits never affect existing bookings. `reference` is the
    public token used by the confirmation page.

    `user_id` links the booking to the customer account that paid for it, which
    is what allows /my to list a customer's purchases. `payment_plan` is
    "full" | "two" | "three" and `instalments_total`/`amount_paid_pence` keep the
    plan's progress queryable without aggregating the instalments table.
    """

    __tablename__ = "bookings"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    reference: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey(f"{DB_SCHEMA}.user_accounts.id"), index=True, nullable=True
    )
    cohort_id: Mapped[int | None] = mapped_column(ForeignKey(f"{DB_SCHEMA}.cohorts.id"), index=True, nullable=True)
    package_id: Mapped[int] = mapped_column(ForeignKey(f"{DB_SCHEMA}.packages.id"), index=True)
    package_name: Mapped[str] = mapped_column(String(255))
    package_price_pence: Mapped[int] = mapped_column(default=0)
    package_currency: Mapped[str] = mapped_column(String(8), default="gbp")
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), index=True)
    due_date: Mapped[str] = mapped_column(String(32), default="")
    postcode: Mapped[str] = mapped_column(String(16), default="")
    partner_name: Mapped[str] = mapped_column(String(255), default="")
    # full | two | three
    payment_plan: Mapped[str] = mapped_column(String(16), default="full")
    instalments_total: Mapped[int] = mapped_column(default=1)
    amount_paid_pence: Mapped[int] = mapped_column(default=0)
    # pending_payment | part_paid | paid | confirmed | cancelled
    status: Mapped[str] = mapped_column(String(32), default="pending_payment", index=True)
    stripe_session_id: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Testimonial(Base):
    """A client testimonial shown on the homepage and /testimonials.

    Admin-authored (no public submission form). `is_published` hides a
    draft/withdrawn quote without destroying it; `sort_order` gives the admin
    control over display order (featured quotes first).
    """

    __tablename__ = "testimonials"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255), default="")
    # Programme/package the quote is about (display text, not an FK — the
    # client may name a tier that is since renamed or retired).
    package: Mapped[str] = mapped_column(String(255), default="")
    quote: Mapped[str] = mapped_column(Text, default="")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class NewsletterSubscriber(Base):
    """An email captured by the footer/homepage newsletter form.

    Local capture first; a Mailchimp/ConvertKit sync can be layered on later.
    `email` is unique (case-insensitive lookups normalise in the handler) so
    repeated submissions are idempotent rather than errors.
    """

    __tablename__ = "newsletter_subscribers"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(64), default="site")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Instalment(Base):
    """One scheduled payment within a booking's payment plan.

    Instalments are always settled in order: sequence 1 is the deposit taken at
    checkout, later sequences are paid from the customer dashboard. `due_date` is
    the date the money must clear — for every instalment after the deposit that
    is deliberately before the cohort starts.

    `is_overdue` is derived rather than stored, so nothing has to run on a
    schedule to keep it accurate.
    """

    __tablename__ = "instalments"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey(f"{DB_SCHEMA}.bookings.id"), index=True)
    sequence: Mapped[int] = mapped_column(default=1)
    amount_pence: Mapped[int] = mapped_column(default=0)
    due_date: Mapped[date] = mapped_column(Date())
    # pending | paid
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    stripe_session_id: Mapped[str] = mapped_column(String(255), default="")
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    @property
    def is_overdue(self) -> bool:
        """True when this instalment should have been paid but has not been."""
        return self.status == "pending" and self.due_date < date.today()

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, Text
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
    """User accounts for future clinical features (Years 4-5)."""

    __tablename__ = "user_accounts"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
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

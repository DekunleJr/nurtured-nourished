"""Add packages, cohorts and bookings tables

Revision ID: 0005_packages_cohorts_bookings
Revises: 0004_add_admin_users
Create Date: 2026-09-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0005_packages_cohorts_bookings"
down_revision: Union[str, None] = "0004_add_admin_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "packages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("tagline", sa.String(length=255), server_default="", nullable=False),
        sa.Column("price_pence", sa.Integer(), server_default="0", nullable=False),
        sa.Column("currency", sa.String(length=8), server_default="gbp", nullable=False),
        sa.Column("blurb", sa.Text(), server_default="", nullable=False),
        sa.Column("features", sa.JSON(), nullable=True),
        sa.Column("price_note", sa.String(length=255), server_default="", nullable=False),
        sa.Column(
            "cta_label", sa.String(length=64), server_default="Book your place", nullable=False
        ),
        sa.Column("is_featured", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("is_published", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default="false", nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_packages_slug"),
        schema="nurture",
    )
    op.create_index("ix_packages_slug", "packages", ["slug"], unique=False, schema="nurture")

    op.create_table(
        "cohorts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("session_time", sa.String(length=64), server_default="", nullable=False),
        sa.Column("capacity", sa.Integer(), server_default="5", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="open", nullable=False),
        sa.Column("notes", sa.Text(), server_default="", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default="false", nullable=False),
        sa.PrimaryKeyConstraint("id"),
        schema="nurture",
    )

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("reference", sa.String(length=32), nullable=False),
        sa.Column("cohort_id", sa.Integer(), nullable=False),
        sa.Column("package_id", sa.Integer(), nullable=False),
        sa.Column("package_name", sa.String(length=255), nullable=False),
        sa.Column("package_price_pence", sa.Integer(), server_default="0", nullable=False),
        sa.Column("package_currency", sa.String(length=8), server_default="gbp", nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("due_date", sa.String(length=32), server_default="", nullable=False),
        sa.Column("postcode", sa.String(length=16), server_default="", nullable=False),
        sa.Column("partner_name", sa.String(length=255), server_default="", nullable=False),
        sa.Column("status", sa.String(length=32), server_default="pending_payment", nullable=False),
        sa.Column("stripe_session_id", sa.String(length=255), server_default="", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), server_default="false", nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference", name="uq_bookings_reference"),
        sa.ForeignKeyConstraint(["cohort_id"], ["nurture.cohorts.id"], name="fk_bookings_cohort"),
        sa.ForeignKeyConstraint(["package_id"], ["nurture.packages.id"], name="fk_bookings_package"),
        schema="nurture",
    )
    op.create_index("ix_bookings_reference", "bookings", ["reference"], unique=False, schema="nurture")
    op.create_index("ix_bookings_cohort_id", "bookings", ["cohort_id"], unique=False, schema="nurture")
    op.create_index("ix_bookings_package_id", "bookings", ["package_id"], unique=False, schema="nurture")
    op.create_index("ix_bookings_email", "bookings", ["email"], unique=False, schema="nurture")
    op.create_index("ix_bookings_status", "bookings", ["status"], unique=False, schema="nurture")


def downgrade() -> None:
    op.drop_index("ix_bookings_status", table_name="bookings", schema="nurture")
    op.drop_index("ix_bookings_email", table_name="bookings", schema="nurture")
    op.drop_index("ix_bookings_package_id", table_name="bookings", schema="nurture")
    op.drop_index("ix_bookings_cohort_id", table_name="bookings", schema="nurture")
    op.drop_index("ix_bookings_reference", table_name="bookings", schema="nurture")
    op.drop_table("bookings", schema="nurture")
    op.drop_table("cohorts", schema="nurture")
    op.drop_index("ix_packages_slug", table_name="packages", schema="nurture")
    op.drop_table("packages", schema="nurture")
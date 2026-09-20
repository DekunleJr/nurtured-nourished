"""Unified customer accounts, cohort length and payment instalments

Revision ID: 0006_accounts_and_instalments
Revises: 0005_packages_cohorts_bookings
Create Date: 2026-09-20

Everything the purchase/checkout flow needs:

* ``user_accounts.password_hash`` so the unified login can authenticate
  customers. The table itself may already exist — it was created by SQLAlchemy's
  ``create_all`` before any migration covered it — so every step below is
  guarded by an existence check and this migration is safe to run either way.
* ``cohorts.duration_weeks``, used to derive the cohort's final session date,
  which is the date that must fall before a participant's due date.
* ``bookings.user_id`` plus the payment-plan columns.
* the ``instalments`` table.

Historical note: this revision replaces a duplicate ``0005`` revision
(``0005_make_cohort_id_nullable``) that pointed at the same ``down_revision`` as
``0005_packages_cohorts_bookings``, which made ``alembic upgrade head`` fail with
"Multiple head revisions are present". That stale file has been deleted; its only
intended change (a nullable ``bookings.cohort_id``) is already part of
``0005_packages_cohorts_bookings``.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006_accounts_and_instalments"
down_revision: Union[str, None] = "0005_packages_cohorts_bookings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SCHEMA = "nurture"


def _inspector():
    return sa.inspect(op.get_bind())


def _table_exists(table: str) -> bool:
    return table in _inspector().get_table_names(schema=SCHEMA)


def _column_exists(table: str, column: str) -> bool:
    if not _table_exists(table):
        return False
    return column in {c["name"] for c in _inspector().get_columns(table, schema=SCHEMA)}


def _foreign_key_exists(table: str, name: str) -> bool:
    if not _table_exists(table):
        return False
    return name in {fk["name"] for fk in _inspector().get_foreign_keys(table, schema=SCHEMA)}


def _add_column_if_missing(table: str, column: sa.Column) -> None:
    if not _column_exists(table, column.name):
        op.add_column(table, column, schema=SCHEMA)


def _add_index_if_missing(table: str, name: str, columns: list) -> None:
    """Create `name` unless the table already has an index on the same columns.

    Matching on columns rather than on the index name keeps this correct when the
    index was created by SQLAlchemy's `create_all`, which prefixes index names
    with the schema (e.g. ``ix_nurture_instalments_status``).
    """
    if not _table_exists(table):
        return
    wanted = list(columns)
    for index in _inspector().get_indexes(table, schema=SCHEMA):
        if list(index.get("column_names") or []) == wanted:
            return
    op.create_index(name, table, columns, unique=False, schema=SCHEMA)


def _has_foreign_key_on(table: str, column: str) -> bool:
    """True when any FK already constrains `column`.

    Checked by column rather than by name because SQLAlchemy's `create_all` (which
    also runs at startup) names its constraints differently from this migration —
    matching on the name alone would risk adding a duplicate constraint.
    """
    if not _table_exists(table):
        return False
    return any(
        column in fk.get("constrained_columns", [])
        for fk in _inspector().get_foreign_keys(table, schema=SCHEMA)
    )


def upgrade() -> None:
    # --- Customer accounts -------------------------------------------------
    if not _table_exists("user_accounts"):
        op.create_table(
            "user_accounts",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), server_default="", nullable=False),
            sa.Column("phone", sa.String(length=32), server_default="", nullable=False),
            sa.Column("postcode", sa.String(length=16), server_default="", nullable=False),
            sa.Column("due_date", sa.String(length=32), server_default="", nullable=False),
            sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column("is_deleted", sa.Boolean(), server_default="false", nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email", name="uq_user_accounts_email"),
            schema=SCHEMA,
        )
        op.create_index(
            "ix_user_accounts_email", "user_accounts", ["email"], unique=False, schema=SCHEMA
        )
    else:
        # The table predates migrations; only the password column is new. Rows
        # that existed before passwords get "" and simply cannot log in until a
        # password is set — see the guard in routers/auth.py.
        _add_column_if_missing(
            "user_accounts",
            sa.Column("password_hash", sa.String(length=255), server_default="", nullable=False),
        )

    # --- Cohort length (drives the "finishes before your due date" rule) ----
    _add_column_if_missing(
        "cohorts",
        sa.Column("duration_weeks", sa.Integer(), server_default="6", nullable=False),
    )

    # --- Booking ownership + payment plan ---------------------------------
    if not _column_exists("bookings", "user_id"):
        op.add_column("bookings", sa.Column("user_id", sa.Integer(), nullable=True), schema=SCHEMA)
    _add_index_if_missing("bookings", "ix_bookings_user_id", ["user_id"])
    if not _has_foreign_key_on("bookings", "user_id"):
        op.create_foreign_key(
            "fk_bookings_user",
            "bookings",
            "user_accounts",
            ["user_id"],
            ["id"],
            source_schema=SCHEMA,
            referent_schema=SCHEMA,
        )
    _add_column_if_missing(
        "bookings",
        sa.Column("payment_plan", sa.String(length=16), server_default="full", nullable=False),
    )
    _add_column_if_missing(
        "bookings",
        sa.Column("instalments_total", sa.Integer(), server_default="1", nullable=False),
    )
    _add_column_if_missing(
        "bookings",
        sa.Column("amount_paid_pence", sa.Integer(), server_default="0", nullable=False),
    )

    # --- Instalments -------------------------------------------------------
    if not _table_exists("instalments"):
        op.create_table(
            "instalments",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("booking_id", sa.Integer(), nullable=False),
            sa.Column("sequence", sa.Integer(), server_default="1", nullable=False),
            sa.Column("amount_pence", sa.Integer(), server_default="0", nullable=False),
            sa.Column("due_date", sa.Date(), nullable=False),
            sa.Column("status", sa.String(length=16), server_default="pending", nullable=False),
            sa.Column("stripe_session_id", sa.String(length=255), server_default="", nullable=False),
            sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column("is_deleted", sa.Boolean(), server_default="false", nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.ForeignKeyConstraint(
                ["booking_id"], [f"{SCHEMA}.bookings.id"], name="fk_instalments_booking"
            ),
            schema=SCHEMA,
        )
    _add_index_if_missing("instalments", "ix_instalments_booking_id", ["booking_id"])
    _add_index_if_missing("instalments", "ix_instalments_status", ["status"])


def downgrade() -> None:
    if _table_exists("instalments"):
        op.drop_index("ix_instalments_status", table_name="instalments", schema=SCHEMA)
        op.drop_index("ix_instalments_booking_id", table_name="instalments", schema=SCHEMA)
        op.drop_table("instalments", schema=SCHEMA)

    if _column_exists("bookings", "amount_paid_pence"):
        op.drop_column("bookings", "amount_paid_pence", schema=SCHEMA)
    if _column_exists("bookings", "instalments_total"):
        op.drop_column("bookings", "instalments_total", schema=SCHEMA)
    if _column_exists("bookings", "payment_plan"):
        op.drop_column("bookings", "payment_plan", schema=SCHEMA)
    if _foreign_key_exists("bookings", "fk_bookings_user"):
        op.drop_constraint("fk_bookings_user", "bookings", type_="foreignkey", schema=SCHEMA)
    if _column_exists("bookings", "user_id"):
        op.drop_index("ix_bookings_user_id", table_name="bookings", schema=SCHEMA)
        op.drop_column("bookings", "user_id", schema=SCHEMA)

    if _column_exists("cohorts", "duration_weeks"):
        op.drop_column("cohorts", "duration_weeks", schema=SCHEMA)

    # password_hash is intentionally NOT dropped: existing rows need it to serve
    # the unified login, and dropping it would make customer accounts unusable.


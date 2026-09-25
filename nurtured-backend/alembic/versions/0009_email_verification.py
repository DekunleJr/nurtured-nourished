"""Add registration email verification state and OTP challenges.

Revision ID: 0009_email_verification
Revises: 0008_password_reset_tokens
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0009_email_verification"
down_revision: Union[str, None] = "0008_password_reset_tokens"
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
    return column in {item["name"] for item in _inspector().get_columns(table, schema=SCHEMA)}


def _add_column_if_missing(table: str, column: sa.Column) -> None:
    if _table_exists(table) and not _column_exists(table, column.name):
        op.add_column(table, column, schema=SCHEMA)


def _add_index_if_missing(table: str, name: str, columns: list[str], unique: bool = False) -> None:
    if not _table_exists(table):
        return
    for index in _inspector().get_indexes(table, schema=SCHEMA):
        if list(index.get("column_names") or []) == columns:
            return
    op.create_index(name, table, columns, unique=unique, schema=SCHEMA)


def upgrade() -> None:
    # Existing customers are grandfathered as verified; only new registrations
    # are required to prove ownership of the email address.
    _add_column_if_missing(
        "user_accounts",
        sa.Column("is_email_verified", sa.Boolean(), server_default="true", nullable=False),
    )
    _add_column_if_missing(
        "user_accounts",
        sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True),
    )

    if not _table_exists("email_verification_tokens"):
        op.create_table(
            "email_verification_tokens",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("challenge_token_hash", sa.String(length=64), nullable=False),
            sa.Column("otp_hash", sa.String(length=64), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("attempts", sa.Integer(), server_default="0", nullable=False),
            sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("challenge_token_hash", name="uq_email_verification_tokens_challenge"),
            sa.ForeignKeyConstraint(
                ["user_id"],
                ["nurture.user_accounts.id"],
                name="fk_email_verification_tokens_user_id",
            ),
            schema=SCHEMA,
        )
    _add_index_if_missing("ix_email_verification_tokens_user_id", "email_verification_tokens", ["user_id"])
    _add_index_if_missing(
        "ix_email_verification_tokens_challenge_token_hash",
        "email_verification_tokens",
        ["challenge_token_hash"],
        unique=True,
    )


def downgrade() -> None:
    if _table_exists("email_verification_tokens"):
        for name in (
            "ix_email_verification_tokens_challenge_token_hash",
            "ix_email_verification_tokens_user_id",
        ):
            for index in _inspector().get_indexes("email_verification_tokens", schema=SCHEMA):
                if index.get("name") == name:
                    op.drop_index(name, table_name="email_verification_tokens", schema=SCHEMA)
                    break
        op.drop_table("email_verification_tokens", schema=SCHEMA)
    if _table_exists("user_accounts"):
        for name in ("email_verified_at", "is_email_verified"):
            if _column_exists("user_accounts", name):
                op.drop_column("user_accounts", name, schema=SCHEMA)

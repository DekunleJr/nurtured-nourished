"""Add single-use customer password-reset tokens.

Revision ID: 0008_password_reset_tokens
Revises: 0007_testimonials_and_subscribers
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0008_password_reset_tokens"
down_revision: Union[str, None] = "0007_testimonials_and_subscribers"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SCHEMA = "nurture"


def _inspector():
    return sa.inspect(op.get_bind())


def _table_exists() -> bool:
    return "password_reset_tokens" in _inspector().get_table_names(schema=SCHEMA)


def _add_index_if_missing(name: str, columns: list[str], unique: bool = False) -> None:
    if not _table_exists():
        return
    for index in _inspector().get_indexes("password_reset_tokens", schema=SCHEMA):
        if list(index.get("column_names") or []) == columns:
            return
    op.create_index(
        name,
        "password_reset_tokens",
        columns,
        unique=unique,
        schema=SCHEMA,
    )


def upgrade() -> None:
    if not _table_exists():
        op.create_table(
            "password_reset_tokens",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("token_hash", sa.String(length=64), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("token_hash", name="uq_password_reset_tokens_token_hash"),
            sa.ForeignKeyConstraint(
                ["user_id"],
                ["nurture.user_accounts.id"],
                name="fk_password_reset_tokens_user_id",
            ),
            schema=SCHEMA,
        )
    _add_index_if_missing("ix_password_reset_tokens_user_id", ["user_id"])
    _add_index_if_missing("ix_password_reset_tokens_token_hash", ["token_hash"], unique=True)


def downgrade() -> None:
    if not _table_exists():
        return
    for name in ("ix_password_reset_tokens_token_hash", "ix_password_reset_tokens_user_id"):
        for index in _inspector().get_indexes("password_reset_tokens", schema=SCHEMA):
            if index.get("name") == name:
                op.drop_index(name, table_name="password_reset_tokens", schema=SCHEMA)
                break
    op.drop_table("password_reset_tokens", schema=SCHEMA)

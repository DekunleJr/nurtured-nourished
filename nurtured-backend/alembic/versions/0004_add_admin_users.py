"""Add admins table for DB-backed admin authentication

Revision ID: 0004_add_admin_users
Revises: 0003_add_audit_fields
Create Date: 2026-09-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_add_admin_users"
down_revision: Union[str, None] = "0003_add_audit_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), server_default="", nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
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
        sa.UniqueConstraint("email", name="uq_admins_email"),
        schema="nurture",
    )
    op.create_index("ix_admins_email", "admins", ["email"], unique=False, schema="nurture")


def downgrade() -> None:
    op.drop_index("ix_admins_email", table_name="admins", schema="nurture")
    op.drop_table("admins", schema="nurture")
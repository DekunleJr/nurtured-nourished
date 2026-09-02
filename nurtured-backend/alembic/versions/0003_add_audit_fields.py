"""Add audit fields (updated_at, is_deleted) to leads and discovery_intake

Revision ID: 0003_add_audit_fields
Revises: 0002_add_contact_message
Create Date: 2026-09-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003_add_audit_fields"
down_revision: Union[str, None] = "0002_add_contact_message"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for table in ("leads", "discovery_intake"):
        op.add_column(
            table,
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            schema="nurture",
        )
        op.add_column(
            table,
            sa.Column(
                "is_deleted",
                sa.Boolean(),
                server_default="false",
                nullable=False,
            ),
            schema="nurture",
        )


def downgrade() -> None:
    for table in ("leads", "discovery_intake"):
        op.drop_column(table, "is_deleted", schema="nurture")
        op.drop_column(table, "updated_at", schema="nurture")

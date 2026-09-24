"""Add testimonials and newsletter_subscribers tables

Revision ID: 0007_testimonials_and_subscribers
Revises: 0006_accounts_and_instalments
Create Date: 2026-09-24

Admin-managed content: client testimonials (published on the homepage and
/testimonials) and local newsletter signups. Every step is guarded by an
existence check so the migration is safe alongside SQLAlchemy's startup
``create_all`` (which may already have created these tables).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007_testimonials_and_subscribers"
down_revision: Union[str, None] = "0006_accounts_and_instalments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SCHEMA = "nurture"


def _inspector():
    return sa.inspect(op.get_bind())


def _table_exists(table: str) -> bool:
    return table in _inspector().get_table_names(schema=SCHEMA)


def _add_index_if_missing(table: str, name: str, columns: list) -> None:
    if not _table_exists(table):
        return
    wanted = list(columns)
    for index in _inspector().get_indexes(table, schema=SCHEMA):
        if list(index.get("column_names") or []) == wanted:
            return
    op.create_index(name, table, columns, unique=False, schema=SCHEMA)


def upgrade() -> None:
    if not _table_exists("testimonials"):
        op.create_table(
            "testimonials",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("location", sa.String(length=255), server_default="", nullable=False),
            sa.Column("package", sa.String(length=255), server_default="", nullable=False),
            sa.Column("quote", sa.Text(), server_default="", nullable=False),
            sa.Column("is_featured", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("is_published", sa.Boolean(), server_default="false", nullable=False),
            sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
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
            schema=SCHEMA,
        )

    if not _table_exists("newsletter_subscribers"):
        op.create_table(
            "newsletter_subscribers",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("source", sa.String(length=64), server_default="site", nullable=False),
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
            sa.UniqueConstraint("email", name="uq_newsletter_subscribers_email"),
            schema=SCHEMA,
        )
    _add_index_if_missing(
        "newsletter_subscribers", "ix_newsletter_subscribers_email", ["email"]
    )


def downgrade() -> None:
    if _table_exists("newsletter_subscribers"):
        op.drop_index(
            "ix_newsletter_subscribers_email",
            table_name="newsletter_subscribers",
            schema=SCHEMA,
        )
        op.drop_table("newsletter_subscribers", schema=SCHEMA)
    if _table_exists("testimonials"):
        op.drop_table("testimonials", schema=SCHEMA)

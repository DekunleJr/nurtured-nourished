import sys
import os

# Add the backend root to sys.path so that 'app' package can be imported.
# env.py lives in alembic/env.py, so its parent's parent is the backend root.
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from sqlalchemy.engine import make_url
from alembic import context

from app.config import DATABASE_URL
from app.database import Base, DB_SCHEMA

# Register every model on Base.metadata so --autogenerate sees them.
from app import models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    # Strip the schema query param from DATABASE_URL for offline mode.
    _db_url = make_url(DATABASE_URL)
    _db_url = _db_url.set(query={})
    url = str(_db_url)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        version_table_schema=DB_SCHEMA,
        include_schemas=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Use DATABASE_URL directly instead of reading from alembic.ini config.
    _db_url = make_url(DATABASE_URL)
    _db_url = _db_url.set(query={})
    connectable = create_engine(
        _db_url,
        poolclass=pool.NullPool,
        connect_args={"options": f"-csearch_path={DB_SCHEMA}"},
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            version_table_schema=DB_SCHEMA,
            include_schemas=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

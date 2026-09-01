from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import subprocess
import sys

from .config import DATABASE_URL

# Extract the schema name from the ?schema=<name> query param (the Railway DSN
# uses ?schema=nurture), then strip it so psycopg2 never sees it. We pin
# search_path on every connection instead.
_url = make_url(DATABASE_URL)
DB_SCHEMA = dict(_url.query).pop("schema", "nurture")
_url = _url.set(query={})

engine = create_engine(
    _url,
    connect_args={"options": f"-csearch_path={DB_SCHEMA}"},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def check_db_connected() -> None:
    """Raise if the database is unreachable. Called at startup so the app
    refuses to serve without a live database connection."""
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))


def run_migrations() -> None:
    """Apply all pending Alembic migrations via the CLI. Raises on failure
    so the app does not start with an out-of-date schema."""
    venv_scripts = os.path.dirname(sys.executable)
    alembic_cli = os.path.join(venv_scripts, "alembic.exe")
    result = subprocess.run(
        [alembic_cli, "upgrade", "head"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"Alembic migration failed (exit {result.returncode}):\n"
            f"{result.stdout}\n{result.stderr}"
        )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

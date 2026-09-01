from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import DATABASE_URL

# The connection URL may already carry a ?schema=<name> query param (the supplied
# Railway DSN uses ?schema=nurture). Honour that value and pin every connection's
# search_path to it so all tables are created in the "nurture" schema.
_url = make_url(DATABASE_URL)
_query = dict(_url.query)
DB_SCHEMA = _query.pop("schema", "nurture")
_url = _url.set(query=_query)

engine = create_engine(
    _url,
    connect_args={"options": f"-csearch_path={DB_SCHEMA}"},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def init_db() -> None:
    """Create the target schema (best effort) and all tables."""
    with engine.begin() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}"))
    from . import models  # noqa: F401  (register models on Base.metadata)
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
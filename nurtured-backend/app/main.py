import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from .config import ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, CORS_ORIGINS, ENV
from .database import check_db_connected, init_tables, engine, DB_SCHEMA, SessionLocal
from .models import AdminUser, ProgrammePackage
from .rate_limit import limiter
from .utils.auth import hash_password
from .routers import auth, bookings, catalogue, checkout, contact, discovery, leads
from .routers import admin, admin_catalogue

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("nurture.api")


def seed_first_admin() -> None:
    """Seed the first admin account from ADMIN_EMAIL/ADMIN_PASSWORD env vars.

    Only runs when the admins table contains no (non-deleted) admin, so it is a
    safe one-time bootstrap. All later admins are managed from the dashboard.
    """
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        return
    with SessionLocal() as db:
        existing = (
            db.query(AdminUser)
            .filter(AdminUser.is_deleted == False)  # noqa: E712
            .first()
        )
        if existing is not None:
            return
        db.add(
            AdminUser(
                email=ADMIN_EMAIL,
                name=ADMIN_NAME,
                password_hash=hash_password(ADMIN_PASSWORD),
            )
        )
        db.commit()
        logger.info("Seeded first admin account: %s", ADMIN_EMAIL)


# Approved launch packages, seeded only when the packages table is empty so
# the public site always has content while the admin takes over management.
DEFAULT_PACKAGES = [
    {
        "slug": "foundation",
        "name": "Maternal Foundation",
        "tagline": "A strong beginning.",
        "price_pence": 29500,
        "blurb": "The complete FOBCP™ experience, followed by a private postnatal support session during your first six weeks after birth.",
        "features": [
            "Complete six-week live online FOBCP™",
            "Maximum of five women per cohort",
            "Birth partner or chosen supporter welcome",
            "Premium FOBCP™ programme resources",
            "WhatsApp Programme Support during the six-week programme",
            "1 × 45-minute private online postnatal support session",
            "Postnatal session available within your first 6 weeks after birth",
            "Invitation to the optional cohort Postnatal Reunion, where scheduled",
        ],
        "price_note": "Pay in full or spread the cost with interest-free instalments where available.",
        "cta_label": "Book your place",
        "is_featured": False,
        "sort_order": 1,
    },
    {
        "slug": "continuity",
        "name": "Maternal Continuity",
        "tagline": "More time for individual support.",
        "price_pence": 34500,
        "blurb": "The complete FOBCP™ experience with two private postnatal support sessions available across your first 12 weeks after birth.",
        "features": [
            "Complete six-week live online FOBCP™",
            "Maximum of five women per cohort",
            "Birth partner or chosen supporter welcome",
            "Premium FOBCP™ programme resources",
            "WhatsApp Programme Support during the six-week programme",
            "2 × 45-minute private online postnatal support sessions",
            "Postnatal sessions available within your first 12 weeks after birth",
            "Invitation to the optional cohort Postnatal Reunion, where scheduled",
        ],
        "price_note": "Pay in full or spread the cost with interest-free instalments where available.",
        "cta_label": "Book your place",
        "is_featured": True,
        "sort_order": 2,
    },
    {
        "slug": "extended",
        "name": "Maternal Extended",
        "tagline": "Support that stays with you for longer.",
        "price_pence": 39500,
        "blurb": "The complete FOBCP™ experience with three private postnatal support sessions that can be used across your first six months after birth.",
        "features": [
            "Complete six-week live online FOBCP™",
            "Maximum of five women per cohort",
            "Birth partner or chosen supporter welcome",
            "Premium FOBCP™ programme resources",
            "WhatsApp Programme Support during the six-week programme",
            "3 × 45-minute private online postnatal support sessions",
            "Postnatal sessions available within your first 6 months after birth",
            "Invitation to the optional cohort Postnatal Reunion, where scheduled",
        ],
        "price_note": "Pay in full or spread the cost with interest-free instalments where available.",
        "cta_label": "Book your place",
        "is_featured": False,
        "sort_order": 3,
    },
]


def seed_default_packages() -> None:
    """Seed the approved launch packages when the packages table is empty.

    Runs once at startup so the site never shows an empty catalogue; once the
    admin edits or adds packages this function is a no-op.
    """
    with SessionLocal() as db:
        existing = (
            db.query(ProgrammePackage)
            .filter(ProgrammePackage.is_deleted == False)  # noqa: E712
            .first()
        )
        if existing is not None:
            return
        for data in DEFAULT_PACKAGES:
            db.add(ProgrammePackage(**data))
        db.commit()
        logger.info("Seeded default programme packages (%d)", len(DEFAULT_PACKAGES))


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Nurtured & Nourished API (env=%s)", ENV)
    try:
        check_db_connected()
        logger.info("Database connected successfully (schema=%s)", DB_SCHEMA)
    except Exception as exc:
        logger.error("Failed to connect to database: %s", exc)
        sys.exit("FATAL: Database connection failed. Application shutting down.")
    try:
        init_tables()
        logger.info("Tables ready in schema '%s'", DB_SCHEMA)
    except Exception as exc:
        logger.error("Failed to initialise tables: %s", exc)
        sys.exit("FATAL: Table initialisation failed. Application shutting down.")
    try:
        seed_first_admin()
    except Exception as exc:
        # Non-fatal: the app can still serve; but log loudly so missing
        # bootstrap credentials are noticed.
        logger.error("Failed to seed first admin: %s", exc)
    try:
        seed_default_packages()
    except Exception as exc:
        # Non-fatal: the public site falls back to static content if this fails.
        logger.error("Failed to seed default packages: %s", exc)
    logger.info("Application startup complete")
    yield
    engine.dispose()
    logger.info("Application shut down cleanly")


app = FastAPI(title="Nurtured & Nourished API", version="0.1.0", lifespan=lifespan)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded. Please try again later."},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(discovery.router)
app.include_router(contact.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(admin_catalogue.router)
app.include_router(catalogue.router)
app.include_router(bookings.router)
app.include_router(checkout.router)


@app.get("/health")
def health():
    """Deep health check: verifies the live database connection, schema, and tables."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            result = conn.execute(
                text(
                    "SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema = :s ORDER BY table_name"
                ),
                {"s": DB_SCHEMA},
            )
            tables = [row[0] for row in result]
        return {
            "status": "ok",
            "database": "connected",
            "schema": DB_SCHEMA,
            "tables": tables,
            "env": ENV,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "unreachable",
                "detail": str(exc),
                "env": ENV,
            },
        )

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from .config import CORS_ORIGINS, ENV
from .database import check_db_connected, init_tables, engine, DB_SCHEMA
from .rate_limit import limiter
from .routers import contact, discovery, leads
from .routers import admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("nurture.api")


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
app.include_router(admin.router)


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

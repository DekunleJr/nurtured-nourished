import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import CORS_ORIGINS, ENV
from .database import check_db_connected, init_tables, engine, DB_SCHEMA
from .routers import discovery, leads

# Configure logging to output to console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("nurture.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Nurtured &amp; Nourished API (env=%s)", ENV)
    # Check database connectivity \u2014 refuse to start if unreachable.
    try:
        check_db_connected()
        logger.info("Database connected successfully (schema=%s)", DB_SCHEMA)
    except Exception as exc:
        logger.error("Failed to connect to database: %s", exc)
        sys.exit("FATAL: Database connection failed. Application shutting down.")
    # Create tables if they don\'t exist (idempotent).
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


app = FastAPI(title="Nurtured &amp; Nourished API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(discovery.router)


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
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "unreachable",
                "detail": str(exc),
                "env": ENV,
            },
        )

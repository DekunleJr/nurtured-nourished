from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import CORS_ORIGINS, ENV
from .database import check_db_connected, run_migrations, engine, DB_SCHEMA
from .routers import discovery, leads


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Refuse to start if the database is unreachable or migrations fail.
    check_db_connected()
    run_migrations()
    yield
    engine.dispose()


app = FastAPI(title="Nurtured & Nourished API", version="0.1.0", lifespan=lifespan)

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

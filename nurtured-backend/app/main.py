from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS, ENV
from .database import init_db
from .routers import discovery, leads


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as exc:
        # Keep the API running even if the database is unreachable.
        print(f"[startup] DB initialisation skipped: {exc}")
    yield


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
    return {"status": "ok", "env": ENV}
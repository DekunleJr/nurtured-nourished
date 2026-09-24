"""Shared fixtures for the API test suite.

Everything is hermetic: ``get_db`` is overridden with the in-memory FakeDB and
TestClient is used WITHOUT a context manager, so the app lifespan (database
check, admin/package seeding) never runs — tests can never touch Postgres.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import SESSION_COOKIE
from app.database import get_db
from app.main import app
from app.rate_limit import limiter
from app.utils.auth import create_token
from fake_db import FakeDB

ADMIN_SESSION = ("admin", "admin@example.test", "Test Admin")
CUSTOMER_SESSION = ("user", "customer@example.test", "Test Customer")


@pytest.fixture(autouse=True)
def _reset_rate_limit_buckets():
    """slowapi keeps its counters in memory for the whole process.

    The public POST endpoints are capped at ``5/minute``, so without clearing
    between tests a suite run would eventually 429 an unrelated test. Resetting
    keeps every test's rate-limit budget whole (and no test depends on 429).
    """
    limiter.reset()
    try:
        yield
    finally:
        limiter.reset()


def _token(role: str, email: str, name: str) -> str:
    return create_token(1, email, name, role)


@pytest.fixture
def fake_db() -> FakeDB:
    return FakeDB()


@pytest.fixture
def client(fake_db: FakeDB):
    """TestClient with an admin session and the DB dependency overridden."""
    app.dependency_overrides[get_db] = lambda: fake_db
    c = TestClient(app)  # no context manager → lifespan never runs
    c.cookies.set(SESSION_COOKIE, _token(*ADMIN_SESSION))
    try:
        yield c
    finally:
        app.dependency_overrides.pop(get_db, None)
        c.cookies.clear()


@pytest.fixture
def anon_client(fake_db: FakeDB):
    """TestClient with NO session cookie (for auth-guard tests)."""
    app.dependency_overrides[get_db] = lambda: fake_db
    c = TestClient(app)
    try:
        yield c
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def customer_client(fake_db: FakeDB):
    """TestClient holding a valid *customer* session (must get 403 everywhere)."""
    app.dependency_overrides[get_db] = lambda: fake_db
    c = TestClient(app)
    c.cookies.set(SESSION_COOKIE, _token(*CUSTOMER_SESSION))
    try:
        yield c
    finally:
        app.dependency_overrides.pop(get_db, None)
        c.cookies.clear()

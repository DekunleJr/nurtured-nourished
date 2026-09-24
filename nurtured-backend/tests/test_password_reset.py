"""Customer password recovery endpoint tests.

The email sender is replaced with a capture function so these tests are fully
hermetic and never call Resend.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.routers import auth as auth_router
from app.utils.auth import hash_password
import bcrypt
from fake_db import FakeDB


def _seed_customer(db: FakeDB, **overrides):
    from app.models import UserAccount

    fields = dict(
        name="Mary Jones",
        email="mary@example.com",
        password_hash=hash_password("old-password"),
        due_date="2027-01-01",
        phone="",
        is_active=True,
        is_deleted=False,
    )
    fields.update(overrides)
    return db.seed(UserAccount, **fields)


def test_forgot_password_is_generic_and_creates_one_hashed_token(
    anon_client, fake_db: FakeDB, monkeypatch
):
    user = _seed_customer(fake_db)
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(
        auth_router,
        "send_password_reset_email",
        lambda recipient, reset_url: sent.append((recipient, reset_url)) or True,
    )

    response = anon_client.post(
        "/api/auth/forgot-password", json={"email": " MARY@example.com "}
    )
    assert response.status_code == 200, response.text
    assert response.json() == {
        "message": "If an account exists for that email, password reset instructions have been sent."
    }
    assert len(sent) == 1
    assert sent[0][0] == "mary@example.com"
    assert "/reset-password?token=" in sent[0][1]

    from app.models import PasswordResetToken

    rows = fake_db.store[PasswordResetToken]
    assert len(rows) == 1
    assert rows[0].user_id == user.id
    assert rows[0].token_hash != sent[0][1].split("token=", 1)[1]
    assert len(rows[0].token_hash) == 64


def test_unknown_email_returns_same_generic_response(anon_client, fake_db: FakeDB, monkeypatch):
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(
        auth_router,
        "send_password_reset_email",
        lambda recipient, reset_url: sent.append((recipient, reset_url)) or True,
    )
    response = anon_client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    assert response.status_code == 200
    assert response.json() == {
        "message": "If an account exists for that email, password reset instructions have been sent."
    }
    assert sent == []


def test_reset_password_uses_token_once_and_updates_bcrypt_hash(
    anon_client, fake_db: FakeDB, monkeypatch
):
    user = _seed_customer(fake_db)
    sent: list[str] = []
    monkeypatch.setattr(
        auth_router,
        "send_password_reset_email",
        lambda recipient, reset_url: sent.append(reset_url) or True,
    )
    anon_client.post("/api/auth/forgot-password", json={"email": user.email})
    raw_token = sent[0].split("token=", 1)[1]

    response = anon_client.post(
        "/api/auth/reset-password", json={"token": raw_token, "password": "new-password"}
    )
    assert response.status_code == 200, response.text
    assert response.json()["message"] == "Your password has been reset. You can now sign in."
    assert bcrypt.checkpw(b"new-password", user.password_hash.encode("utf-8"))

    replay = anon_client.post(
        "/api/auth/reset-password", json={"token": raw_token, "password": "another-password"}
    )
    assert replay.status_code == 400
    assert "invalid or has expired" in replay.json()["detail"]


def test_expired_reset_token_is_rejected(anon_client, fake_db: FakeDB, monkeypatch):
    user = _seed_customer(fake_db)
    sent: list[str] = []
    monkeypatch.setattr(
        auth_router,
        "send_password_reset_email",
        lambda recipient, reset_url: sent.append(reset_url) or True,
    )
    anon_client.post("/api/auth/forgot-password", json={"email": user.email})
    raw_token = sent[0].split("token=", 1)[1]

    from app.models import PasswordResetToken

    fake_db.store[PasswordResetToken][0].expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    response = anon_client.post(
        "/api/auth/reset-password", json={"token": raw_token, "password": "new-password"}
    )
    assert response.status_code == 400
    assert "invalid or has expired" in response.json()["detail"]


def test_inactive_customer_does_not_receive_reset_link(anon_client, fake_db: FakeDB, monkeypatch):
    _seed_customer(fake_db, is_active=False)
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(
        auth_router,
        "send_password_reset_email",
        lambda recipient, reset_url: sent.append((recipient, reset_url)) or True,
    )
    response = anon_client.post("/api/auth/forgot-password", json={"email": "mary@example.com"})
    assert response.status_code == 200
    assert sent == []

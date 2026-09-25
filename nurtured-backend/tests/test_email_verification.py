"""Registration OTP tests, including the checkout-session contract."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt
from app.routers import auth as auth_router
from app.utils.auth import hash_password
from fake_db import FakeDB


def _register(client, fake_db: FakeDB, monkeypatch, email="new@example.com"):
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(
        auth_router,
        "send_email_verification_otp",
        lambda recipient, otp: sent.append((recipient, otp)) or True,
    )
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Mary Jones",
            "email": email,
            "due_date": "2027-01-01",
            "phone": "",
            "password": "new-password",
        },
    )
    assert response.status_code == 201, response.text
    assert response.json()["verification_required"] is True
    assert len(sent) == 1
    return response.json(), sent[0][1], sent[0][0]


def test_registration_does_not_issue_session_before_otp(anon_client, fake_db: FakeDB, monkeypatch):
    registration, _otp, _recipient = _register(anon_client, fake_db, monkeypatch)
    assert "session" not in registration
    assert registration["challenge_token"]
    assert anon_client.get("/api/auth/me").status_code == 401

    from app.models import EmailVerificationToken, UserAccount

    user = fake_db.store[UserAccount][0]
    challenge = fake_db.store[EmailVerificationToken][0]
    assert user.is_email_verified is False
    assert challenge.challenge_token_hash != registration["challenge_token"]


def test_correct_otp_marks_email_verified_and_creates_session(
    anon_client, fake_db: FakeDB, monkeypatch
):
    registration, otp, recipient = _register(anon_client, fake_db, monkeypatch)
    response = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": otp},
    )
    assert response.status_code == 200, response.text
    assert response.json()["email"] == recipient
    assert response.json()["email_verified"] is True
    assert response.json()["role"] == "user"

    me = anon_client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == recipient

    from app.models import UserAccount

    assert fake_db.store[UserAccount][0].is_email_verified is True


def test_incorrect_otp_does_not_issue_session_and_counts_attempt(
    anon_client, fake_db: FakeDB, monkeypatch
):
    registration, _otp, _recipient = _register(anon_client, fake_db, monkeypatch)
    response = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": "000000"},
    )
    assert response.status_code == 400
    assert "not correct" in response.json()["detail"]
    assert anon_client.get("/api/auth/me").status_code == 401

    from app.models import EmailVerificationToken

    assert fake_db.store[EmailVerificationToken][0].attempts == 1



def test_resend_replaces_otp_and_old_code_no_longer_works(
    anon_client, fake_db: FakeDB, monkeypatch
):
    registration, old_otp, _recipient = _register(anon_client, fake_db, monkeypatch)
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(
        auth_router,
        "send_email_verification_otp",
        lambda recipient, otp: sent.append((recipient, otp)) or True,
    )
    response = anon_client.post(
        "/api/auth/resend-verification",
        json={"challenge_token": registration["challenge_token"]},
    )
    assert response.status_code == 200
    assert "new verification code" in response.json()["message"]
    assert len(sent) == 1
    new_otp = sent[0][1]

    old_response = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": old_otp},
    )
    assert old_response.status_code == 400
    new_response = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": new_otp},
    )
    assert new_response.status_code == 200


def test_unverified_customer_cannot_login_but_verified_customer_can(
    anon_client, fake_db: FakeDB, monkeypatch
):
    registration, otp, _recipient = _register(anon_client, fake_db, monkeypatch)
    rejected = anon_client.post(
        "/api/auth/login", json={"email": "new@example.com", "password": "new-password"}
    )
    assert rejected.status_code == 403
    assert "verify your email" in rejected.json()["detail"]

    verified = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": otp},
    )
    assert verified.status_code == 200
    logged_in = anon_client.post(
        "/api/auth/login", json={"email": "new@example.com", "password": "new-password"}
    )
    assert logged_in.status_code == 200
    assert logged_in.json()["role"] == "user"


def test_existing_customer_model_defaults_to_verified(fake_db: FakeDB):
    from app.models import UserAccount

    user = fake_db.seed(
        UserAccount,
        name="Existing Customer",
        email="existing@example.com",
        password_hash=hash_password("existing-password"),
    )
    assert user.is_email_verified is True
    assert user.email_verified_at is None
    assert bcrypt.checkpw(b"existing-password", user.password_hash.encode("utf-8"))


def test_expired_and_reused_otp_are_rejected(anon_client, fake_db: FakeDB, monkeypatch):
    registration, otp, _recipient = _register(anon_client, fake_db, monkeypatch)
    from app.models import EmailVerificationToken

    challenge = fake_db.store[EmailVerificationToken][0]
    challenge.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    expired = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": otp},
    )
    assert expired.status_code == 400
    assert "expired" in expired.json()["detail"]

    challenge.expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    first = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": otp},
    )
    assert first.status_code == 200
    replay = anon_client.post(
        "/api/auth/verify-email",
        json={"challenge_token": registration["challenge_token"], "otp": otp},
    )
    assert replay.status_code == 400
    assert "expired" in replay.json()["detail"]

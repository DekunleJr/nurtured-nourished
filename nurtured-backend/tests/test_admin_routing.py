"""Phase 0 regression: admin route REGISTRATION ORDER.

The bug these tests guard against: ``app.include_router`` used to register
``admin.router`` BEFORE ``admin_catalogue.router``. Starlette picks the first
route whose path matches and only then does FastAPI validate its path params,
so literal catalogue paths such as ``GET /api/admin/packages`` matched the
generic ``GET /api/admin/{submission_type}`` (Literal: leads|discovery|contacts)
route and died with 422 — the entire packages/cohorts/bookings admin API was
unreachable. If the include order in app/main.py is ever reverted, the
"reaches its handler" tests below fail with 422 again.

See the ORDER MATTERS comment in app/main.py.
"""
from __future__ import annotations

from fake_db import FakeDB

CATALOGUE_LIST_ENDPOINTS = (
    "/api/admin/packages",
    "/api/admin/cohorts",
    "/api/admin/bookings",
)

ARCHIVE_RESTORE_ENDPOINTS = (
    "/api/admin/packages/999/archive",
    "/api/admin/packages/999/restore",
    "/api/admin/cohorts/999/archive",
    "/api/admin/cohorts/999/restore",
    "/api/admin/bookings/999/archive",
    "/api/admin/bookings/999/restore",
)


def test_catalogue_list_endpoints_reach_their_handlers(client):
    """200 (empty list) — NOT 422 from the generic submission route."""
    for path in CATALOGUE_LIST_ENDPOINTS:
        resp = client.get(path)
        assert resp.status_code == 200, f"{path} → {resp.status_code}: {resp.text}"
        assert resp.json()["items"] == []
        assert resp.json()["total"] == 0


def test_catalogue_archive_restore_reach_their_handlers(client):
    """404 = handler ran and found no row; 422 = the generic route swallowed it."""
    for path in ARCHIVE_RESTORE_ENDPOINTS:
        resp = client.patch(path)
        assert resp.status_code == 404, f"{path} → {resp.status_code}: {resp.text}"


def test_catalogue_booking_status_reaches_its_handler(client):
    # Valid body so a 422 can only mean wrong routing, not missing `status`.
    resp = client.patch("/api/admin/bookings/999/status", json={"status": "paid"})
    assert resp.status_code == 404, resp.text


def test_catalogue_csv_export_reaches_its_handler(client):
    resp = client.get("/api/admin/bookings/export")
    assert resp.status_code == 200, resp.text
    assert resp.headers["content-type"].startswith("text/csv")
    assert resp.text.splitlines()[0].startswith("reference,")


def test_generic_submission_routes_still_work(client):
    resp = client.get("/api/admin/leads")
    assert resp.status_code == 200
    body = resp.json()
    assert body["items"] == []
    assert body["total"] == 0
    assert body["page"] == 1
    assert body["per_page"] == 10


def test_unknown_submission_type_is_rejected(client):
    # Literal path validation rejects anything that is not a known type —
    # proves the generic route is still mounted and still guarded.
    resp = client.get("/api/admin/not-a-real-type")
    assert resp.status_code == 422


def test_admin_endpoints_require_a_session(anon_client):
    for path in (*CATALOGUE_LIST_ENDPOINTS, "/api/admin/leads", "/api/admin/dashboard"):
        assert anon_client.get(path).status_code == 401, path
    resp = anon_client.patch("/api/admin/packages/1/archive")
    assert resp.status_code == 401


def test_customer_session_cannot_reach_admin_api(customer_client):
    """A valid *customer* session must be 403 (wrong role), never 200."""
    for path in (*CATALOGUE_LIST_ENDPOINTS, "/api/admin/leads"):
        assert customer_client.get(path).status_code == 403, path
    resp = customer_client.patch("/api/admin/packages/1/archive")
    assert resp.status_code == 403

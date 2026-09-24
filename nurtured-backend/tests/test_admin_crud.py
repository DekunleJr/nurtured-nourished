"""Tests for the Phase 2–5 admin CRUD endpoints.

Covers: booking edit/create + seat guards, submission editing, admin-user
password/archive guards, customer management, testimonials CRUD, newsletter
capture/list/export. All hermetic via the FakeDB dependency override.
"""
from __future__ import annotations

from datetime import date, timedelta

from fake_db import FakeDB


def _seed_package(db: FakeDB, **overrides):
    from app.models import ProgrammePackage

    fields = dict(
        slug="foundation",
        name="Maternal Foundation",
        price_pence=29500,
        currency="gbp",
        is_published=True,
    )
    fields.update(overrides)
    return db.seed(ProgrammePackage, **fields)


def _seed_cohort(db: FakeDB, capacity=5, **overrides):
    from app.models import Cohort

    fields = dict(
        label="Autumn 2026",
        start_date=date.today() + timedelta(days=30),
        duration_weeks=6,
        capacity=capacity,
        status="open",
    )
    fields.update(overrides)
    return db.seed(Cohort, **fields)


def _seed_booking(db: FakeDB, package, cohort=None, **overrides):
    from app.models import Booking

    fields = dict(
        reference="REF1234567890",
        cohort_id=cohort.id if cohort else None,
        package_id=package.id,
        package_name=package.name,
        package_price_pence=package.price_pence,
        package_currency="gbp",
        name="Mary Jones",
        email="mary@example.com",
        status="confirmed",
    )
    fields.update(overrides)
    return db.seed(Booking, **fields)


# ---------------------------------------------------------------------------
# Bookings: edit + manual create (Phase 2)
# ---------------------------------------------------------------------------
class TestBookingEdit:
    def test_edit_customer_fields(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        booking = _seed_booking(fake_db, pkg)
        resp = client.put(
            f"/api/admin/bookings/{booking.id}",
            json={"name": "Mary Okafor", "postcode": "NR2 2BB", "email": "mary.o@example.com"},
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["name"] == "Mary Okafor"
        assert body["postcode"] == "NR2 2BB"
        assert body["email"] == "mary.o@example.com"

    def test_edit_missing_booking_404(self, client):
        resp = client.put("/api/admin/bookings/999", json={"name": "X"})
        assert resp.status_code == 404

    def test_invalid_email_rejected(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        booking = _seed_booking(fake_db, pkg)
        resp = client.put(
            f"/api/admin/bookings/{booking.id}", json={"email": "not-an-email"}
        )
        assert resp.status_code == 422

    def test_move_to_full_cohort_conflicts(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        full = _seed_cohort(fake_db, capacity=1)
        # The only seat is taken by an active booking.
        _seed_booking(fake_db, pkg, cohort=full, reference="TAKENSEAT0001")
        other = _seed_booking(fake_db, pkg, reference="MOVESEAT00001")

        resp = client.put(
            f"/api/admin/bookings/{other.id}", json={"cohort_id": full.id}
        )
        assert resp.status_code == 409
        assert "fully booked" in resp.json()["detail"]

    def test_move_to_free_cohort_succeeds(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        origin = _seed_cohort(fake_db, capacity=5)
        target = _seed_cohort(fake_db, capacity=5, label="Winter 2026")
        booking = _seed_booking(fake_db, pkg, cohort=origin)

        resp = client.put(
            f"/api/admin/bookings/{booking.id}", json={"cohort_id": target.id}
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["cohort_id"] == target.id

    def test_resaving_own_cohort_does_not_trip_capacity(
        self, client, fake_db: FakeDB
    ):
        """A booking on a 1/1-full cohort may still be re-saved as-is."""
        pkg = _seed_package(fake_db)
        cohort = _seed_cohort(fake_db, capacity=1)
        booking = _seed_booking(fake_db, pkg, cohort=cohort)

        resp = client.put(
            f"/api/admin/bookings/{booking.id}",
            json={"cohort_id": cohort.id, "name": "New Name"},
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["name"] == "New Name"

    def test_package_swap_resnapshots_price(self, client, fake_db: FakeDB):
        original = _seed_package(fake_db, slug="foundation", price_pence=29500)
        upgraded = _seed_package(
            fake_db, slug="continuity", name="Maternal Continuity", price_pence=34500
        )
        booking = _seed_booking(fake_db, original)

        resp = client.put(
            f"/api/admin/bookings/{booking.id}", json={"package_id": upgraded.id}
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["package_name"] == "Maternal Continuity"
        assert body["package_price_pence"] == 34500


class TestManualBookingCreate:
    def test_create_confirmed_booking(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        resp = client.post(
            "/api/admin/bookings",
            json={
                "package_id": pkg.id,
                "name": "Anna Reed",
                "email": "anna@example.com",
                "status": "confirmed",
            },
        )
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["reference"]  # generated, non-empty
        assert body["package_name"] == "Maternal Foundation"
        assert body["amount_paid_pence"] == 29500  # settled offline

    def test_pending_booking_records_no_payment(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        resp = client.post(
            "/api/admin/bookings",
            json={
                "package_id": pkg.id,
                "name": "Reserve Only",
                "email": "reserve@example.com",
                "status": "pending_payment",
            },
        )
        assert resp.status_code == 201
        assert resp.json()["amount_paid_pence"] == 0

    def test_unknown_package_404(self, client):
        resp = client.post(
            "/api/admin/bookings",
            json={"package_id": 404, "name": "X", "email": "x@example.com"},
        )
        assert resp.status_code == 404

    def test_full_cohort_conflicts(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        full = _seed_cohort(fake_db, capacity=1)
        _seed_booking(fake_db, pkg, cohort=full, reference="HOLDFULL0001")
        resp = client.post(
            "/api/admin/bookings",
            json={
                "package_id": pkg.id,
                "cohort_id": full.id,
                "name": "Too Late",
                "email": "late@example.com",
            },
        )
        assert resp.status_code == 409

    def test_requires_admin_session(self, anon_client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        resp = anon_client.post(
            "/api/admin/bookings",
            json={"package_id": pkg.id, "name": "X", "email": "x@example.com"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Submission editing (Phase 3)
# ---------------------------------------------------------------------------
class TestSubmissionEdit:
    def test_edit_lead(self, client, fake_db: FakeDB):
        from app.models import Lead

        lead = fake_db.seed(
            Lead,
            organisation="Acme",
            contact_name="Jo Bloggs",
            job_title="Dir",
            email="jo@acme.example",
            goals="Original",
        )
        resp = client.patch(
            f"/api/admin/leads/{lead.id}",
            json={
                "organisation": "Acme Health CIC",
                "contact_name": "Joanne Bloggs",
                "job_title": "Director",
                "email": "joanne@acme.example",
                "goals": "Updated goals",
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["organisation"] == "Acme Health CIC"
        assert body["email"] == "joanne@acme.example"
        assert body["goals"] == "Updated goals"

    def test_edit_strips_html_like_public_form(self, client, fake_db: FakeDB):
        from app.models import ContactMessage

        msg = fake_db.seed(
            ContactMessage, name="Pat", email="pat@example.com", subject="Hi", message="ok"
        )
        resp = client.patch(
            f"/api/admin/contacts/{msg.id}",
            json={
                "name": "<b>Pat</b>",
                "email": "pat@example.com",
                "subject": "Hi",
                "message": "Hello <script>alert(1)</script>there",
            },
        )
        assert resp.status_code == 200, resp.text
        assert "<b>" not in resp.json()["name"]
        assert "<script>" not in resp.json()["message"]

    def test_edit_invalid_email_422(self, client, fake_db: FakeDB):
        from app.models import Lead

        lead = fake_db.seed(
            Lead,
            organisation="Acme",
            contact_name="Jo",
            job_title="Dir",
            email="jo@acme.example",
            goals="",
        )
        resp = client.patch(
            f"/api/admin/leads/{lead.id}",
            json={
                "organisation": "Acme",
                "contact_name": "Jo",
                "job_title": "Dir",
                "email": "nope",
                "goals": "",
            },
        )
        assert resp.status_code == 422

    def test_edit_missing_record_404(self, client):
        resp = client.patch(
            "/api/admin/leads/999",
            json={
                "organisation": "X",
                "contact_name": "Y",
                "job_title": "Z",
                "email": "y@z.example",
                "goals": "",
            },
        )
        assert resp.status_code == 404

    def test_requires_admin_session(self, anon_client):
        resp = anon_client.patch(
            "/api/admin/leads/1",
            json={
                "organisation": "X",
                "contact_name": "Y",
                "job_title": "Z",
                "email": "y@z.example",
                "goals": "",
            },
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Admin user management (Phase 3)
# ---------------------------------------------------------------------------
def _seed_admin(db: FakeDB, email="other@example.com", **overrides):
    from app.models import AdminUser
    from app.utils.auth import hash_password

    fields = dict(
        email=email,
        name="Other Admin",
        password_hash=hash_password("password123"),
        is_active=True,
    )
    fields.update(overrides)
    return db.seed(AdminUser, **fields)


class TestAdminUsers:
    def test_create_rename_and_password_reset(self, client, fake_db: FakeDB):
        import bcrypt

        created = client.post(
            "/api/admin/users",
            json={"email": "new@example.com", "name": "New Admin", "password": "password123"},
        )
        assert created.status_code == 201, created.text
        admin_id = created.json()["id"]
        assert "password_hash" not in created.json()  # never leaked

        renamed = client.patch(
            f"/api/admin/users/{admin_id}", json={"name": "Renamed Admin"}
        )
        assert renamed.status_code == 200
        assert renamed.json()["name"] == "Renamed Admin"

        reset = client.patch(
            f"/api/admin/users/{admin_id}", json={"password": "newpassword456"}
        )
        assert reset.status_code == 200
        row = next(
            r for r in fake_db.store[__import__("app.models", fromlist=["AdminUser"]).AdminUser]
            if r.id == admin_id
        )
        # New password verifies; old one no longer does.
        assert bcrypt.checkpw(b"newpassword456", row.password_hash.encode())
        assert not bcrypt.checkpw(b"password123", row.password_hash.encode())

    def test_short_password_rejected(self, client):
        resp = client.patch("/api/admin/users/1", json={"password": "short"})
        assert resp.status_code == 422

    def test_cannot_archive_self(self, client, fake_db: FakeDB):
        """Session token carries sub=1 → archiving id 1 must be blocked.

        The self-guard runs before the last-admin guard, so seeding just the
        session owner (id=1) is enough to hit "your own account".
        """
        from app.models import AdminUser

        _seed_admin(fake_db, email="self@example.com")  # id=1 (session owner)
        owner = next(r for r in fake_db.store[AdminUser] if r.id == 1)
        resp = client.patch(f"/api/admin/users/{owner.id}", json={"is_deleted": True})
        assert resp.status_code == 400
        assert "your own" in resp.json()["detail"]

    def test_cannot_archive_last_active_admin(self, client, fake_db: FakeDB):
        # id=2 so the target is NOT the session owner (sub=1) — otherwise the
        # self-guard would fire instead of the last-admin guard.
        admin = _seed_admin(fake_db, id=2, email="sole@example.com")
        resp = client.patch(f"/api/admin/users/{admin.id}", json={"is_deleted": True})
        assert resp.status_code == 400
        assert "last active admin" in resp.json()["detail"]

    def test_can_archive_other_when_another_active_exists(
        self, client, fake_db: FakeDB
    ):
        target = _seed_admin(fake_db, id=2, email="target@example.com")
        _seed_admin(fake_db, id=3, email="colleague@example.com")
        resp = client.patch(f"/api/admin/users/{target.id}", json={"is_deleted": True})
        assert resp.status_code == 200, resp.text
        assert resp.json()["id"] == target.id
        # Archived admins drop out of the list.
        listed = client.get("/api/admin/users").json()
        assert all(a["id"] != target.id for a in listed)


# === SPLIT_MARKER ===

# ---------------------------------------------------------------------------
# Customer management (Phase 4) — read/update/archive only, never hard delete
# ---------------------------------------------------------------------------
def _seed_customer(db: FakeDB, email="mary@example.com", **overrides):
    from app.models import UserAccount

    fields = dict(
        email=email,
        name="Mary Jones",
        password_hash="",
        phone="07700900000",
        postcode="SW1A 1AA",
        due_date="2027-01-15",
        is_active=True,
    )
    fields.update(overrides)
    return db.seed(UserAccount, **fields)


class TestCustomers:
    def test_list_includes_batched_booking_counts(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        mary = _seed_customer(fake_db, email="mary@example.com")
        other = _seed_customer(fake_db, email="other@example.com")
        _seed_booking(fake_db, pkg, user_id=mary.id, reference="REF1")
        _seed_booking(fake_db, pkg, user_id=mary.id, reference="REF2")
        _seed_booking(
            fake_db, pkg, user_id=other.id, reference="REF3", is_deleted=True
        )

        body = client.get("/api/admin/customers").json()
        assert body["total"] == 2
        assert body["page"] == 1
        counts = {c["id"]: c["bookings_count"] for c in body["items"]}
        assert counts[mary.id] == 2
        # Archived bookings must not inflate the count.
        assert counts[other.id] == 0

    def test_list_never_leaks_password_hash(self, client, fake_db: FakeDB):
        _seed_customer(fake_db)
        item = client.get("/api/admin/customers").json()["items"][0]
        assert "password_hash" not in item

    def test_search_matches_name_email_or_postcode(self, client, fake_db: FakeDB):
        _seed_customer(fake_db, email="mary@example.com", name="Mary Jones")
        _seed_customer(
            fake_db, email="ada@example.com", name="Ada Lovelace", postcode="M1 1AE"
        )

        assert client.get("/api/admin/customers?q=ada").json()["total"] == 1
        assert client.get("/api/admin/customers?q=MARY").json()["total"] == 1
        assert client.get("/api/admin/customers?q=m1 1a").json()["total"] == 1
        assert client.get("/api/admin/customers?q=nobody").json()["total"] == 0

    def test_pagination_and_per_page_clamp(self, client, fake_db: FakeDB):
        for i in range(3):
            _seed_customer(fake_db, email=f"c{i}@example.com")

        page1 = client.get("/api/admin/customers?page=1&per_page=2").json()
        assert page1["total"] == 3
        assert len(page1["items"]) == 2

        page2 = client.get("/api/admin/customers?page=2&per_page=2").json()
        assert len(page2["items"]) == 1
        ids = {c["id"] for c in page1["items"]} | {c["id"] for c in page2["items"]}
        assert len(ids) == 3  # pages are disjoint and cover everyone

        clamped = client.get("/api/admin/customers?per_page=500").json()
        assert clamped["per_page"] == 100


    def test_archived_hidden_unless_requested(self, client, fake_db: FakeDB):
        customer = _seed_customer(fake_db)
        archived = client.patch(f"/api/admin/customers/{customer.id}/archive")
        assert archived.status_code == 200, archived.text
        assert archived.json()["is_deleted"] is True

        assert client.get("/api/admin/customers").json()["total"] == 0
        listed = client.get("/api/admin/customers?include_deleted=true").json()
        assert listed["total"] == 1

        restored = client.patch(f"/api/admin/customers/{customer.id}/restore")
        assert restored.status_code == 200
        assert restored.json()["is_deleted"] is False
        assert client.get("/api/admin/customers").json()["total"] == 1

    def test_detail_returns_booking_history(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        customer = _seed_customer(fake_db)
        _seed_booking(
            fake_db, pkg, user_id=customer.id, reference="REF1", amount_paid_pence=5000
        )
        _seed_booking(
            fake_db, pkg, user_id=customer.id, reference="REF2", is_deleted=True
        )

        body = client.get(f"/api/admin/customers/{customer.id}").json()
        assert body["email"] == customer.email
        assert body["bookings_count"] == 1
        assert [b["reference"] for b in body["bookings"]] == ["REF1"]
        assert body["bookings"][0]["amount_paid_pence"] == 5000

    def test_detail_unknown_is_404(self, client):
        assert client.get("/api/admin/customers/999").status_code == 404

    def test_update_fields_and_deactivate(self, client, fake_db: FakeDB):
        customer = _seed_customer(fake_db)
        resp = client.patch(
            f"/api/admin/customers/{customer.id}",
            json={
                "name": "  Mary J Jones  ",
                "phone": "07700900123",
                "postcode": "EH1 1YZ",
                "due_date": "2027-02-01",
                "is_active": False,
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["name"] == "Mary J Jones"  # whitespace stripped
        assert body["phone"] == "07700900123"
        assert body["postcode"] == "EH1 1YZ"
        assert body["due_date"] == "2027-02-01"
        assert body["is_active"] is False
        # Persisted, not just echoed back.
        assert fake_db.store[type(customer)][0].name == "Mary J Jones"

    def test_update_partial_leaves_other_fields_alone(self, client, fake_db: FakeDB):
        customer = _seed_customer(fake_db)
        resp = client.patch(
            f"/api/admin/customers/{customer.id}", json={"phone": "07700900999"}
        )
        assert resp.status_code == 200
        assert resp.json()["phone"] == "07700900999"
        assert resp.json()["name"] == "Mary Jones"
        assert resp.json()["due_date"] == "2027-01-15"

    def test_update_validates_and_404s(self, client, fake_db: FakeDB):
        customer = _seed_customer(fake_db)
        blank = client.patch(f"/api/admin/customers/{customer.id}", json={"name": ""})
        assert blank.status_code == 422
        unknown = client.patch("/api/admin/customers/999", json={"name": "X"})
        assert unknown.status_code == 404
        assert client.patch("/api/admin/customers/999/archive").status_code == 404
        assert client.patch("/api/admin/customers/999/restore").status_code == 404

    def test_hard_delete_is_not_exposed(self, client, fake_db: FakeDB):
        """Bookings reference user_id → archiving is the only removal path."""
        customer = _seed_customer(fake_db)
        assert client.delete(f"/api/admin/customers/{customer.id}").status_code == 405

    def test_export_csv_has_booking_counts_and_escapes(self, client, fake_db: FakeDB):
        pkg = _seed_package(fake_db)
        mary = _seed_customer(fake_db, email="mary@example.com", name="Jones, Mary")
        _seed_booking(fake_db, pkg, user_id=mary.id, reference="REF1")

        resp = client.get("/api/admin/customers/export")
        assert resp.status_code == 200, resp.text
        assert resp.headers["content-type"].startswith("text/csv")
        assert "customers-export.csv" in resp.headers["content-disposition"]
        lines = resp.text.splitlines()
        assert lines[0].split(",") == [
            "id", "email", "name", "phone", "postcode", "due_date",
            "is_active", "bookings_count", "created_at",
        ]
        assert '"Jones, Mary"' in lines[1]  # commas quoted, not split
        assert ",1," in lines[1]  # bookings_count column

    def test_export_excludes_archived_by_default(self, client, fake_db: FakeDB):
        _seed_customer(fake_db, email="live@example.com")
        gone = _seed_customer(fake_db, email="gone@example.com")
        client.patch(f"/api/admin/customers/{gone.id}/archive")

        assert "gone@example.com" not in client.get("/api/admin/customers/export").text
        everything = client.get("/api/admin/customers/export?include_deleted=true")
        assert "gone@example.com" in everything.text

    def test_requires_admin_session(self, anon_client, customer_client, fake_db: FakeDB):
        customer = _seed_customer(fake_db)
        for path in (
            "/api/admin/customers",
            "/api/admin/customers/export",
            f"/api/admin/customers/{customer.id}",
        ):
            assert anon_client.get(path).status_code == 401, path
            assert customer_client.get(path).status_code == 403, path
        for path in (
            f"/api/admin/customers/{customer.id}/archive",
            f"/api/admin/customers/{customer.id}/restore",
        ):
            assert anon_client.patch(path).status_code == 401, path
            assert customer_client.patch(path).status_code == 403, path
        hijack = anon_client.patch(
            f"/api/admin/customers/{customer.id}", json={"name": "Hack"}
        )
        assert hijack.status_code == 401
        assert fake_db.store[type(customer)][0].name == "Mary Jones"


# ---------------------------------------------------------------------------
# Testimonials (Phase 5) — admin CRUD + public publish filter
# ---------------------------------------------------------------------------
def _seed_testimonial(db: FakeDB, name="Mary Jones", **overrides):
    from app.models import Testimonial

    fields = dict(
        name=name,
        location="Edinburgh",
        package="Maternal Foundation",
        quote="The most grounding six weeks of my pregnancy.",
        is_featured=False,
        is_published=True,
        sort_order=0,
    )
    fields.update(overrides)
    return db.seed(Testimonial, **fields)


class TestTestimonials:
    def test_public_list_only_shows_published_and_live(
        self, anon_client, fake_db: FakeDB
    ):
        """The homepage read is public but must never expose drafts/archives."""
        _seed_testimonial(fake_db, name="Published")
        _seed_testimonial(fake_db, name="Draft", is_published=False)
        _seed_testimonial(fake_db, name="Removed", is_deleted=True)

        resp = anon_client.get("/api/testimonials")
        assert resp.status_code == 200, resp.text
        items = resp.json()["items"]
        assert [t["name"] for t in items] == ["Published"]
        # Public records include stable display identity and ordering, but never
        # publish/audit flags or timestamps.
        assert set(items[0]) == {
            "id",
            "name",
            "location",
            "package",
            "quote",
            "is_featured",
            "sort_order",
        }

    def test_public_order_is_featured_then_sort_order(
        self, anon_client, fake_db: FakeDB
    ):
        _seed_testimonial(fake_db, name="Later", sort_order=2)
        _seed_testimonial(fake_db, name="First", sort_order=1)
        _seed_testimonial(fake_db, name="Featured", sort_order=5, is_featured=True)

        names = [t["name"] for t in anon_client.get("/api/testimonials").json()["items"]]
        assert names == ["Featured", "First", "Later"]

    def test_admin_list_includes_drafts_and_hides_archived(
        self, client, fake_db: FakeDB
    ):
        _seed_testimonial(fake_db, name="Live", sort_order=1)
        _seed_testimonial(fake_db, name="Draft", is_published=False, sort_order=2)
        gone = _seed_testimonial(fake_db, name="Gone", sort_order=3, is_deleted=True)

        body = client.get("/api/admin/testimonials").json()
        assert body["total"] == 2
        assert [t["name"] for t in body["items"]] == ["Live", "Draft"]

        with_deleted = client.get("/api/admin/testimonials?include_deleted=true").json()
        assert with_deleted["total"] == 3
        assert gone.id in [t["id"] for t in with_deleted["items"]]

    def test_create_update_archive_restore_roundtrip(self, client, fake_db: FakeDB):
        created = client.post(
            "/api/admin/testimonials",
            json={
                "name": "Ada Lovelace",
                "location": "London",
                "package": "Maternal Continuity",
                "quote": "I felt held from the first session.",
            },
        )
        assert created.status_code == 201, created.text
        body = created.json()
        testimonial_id = body["id"]
        # Defaults are draft + not featured, so nothing hits the public site
        # until an admin publishes deliberately.
        assert body["is_published"] is False
        assert body["is_featured"] is False
        assert client.get("/api/testimonials").json()["items"] == []

        updated = client.put(
            f"/api/admin/testimonials/{testimonial_id}",
            json={
                "name": "Ada Lovelace",
                "location": "London",
                "package": "Maternal Continuity",
                "quote": "Updated quote.",
                "is_featured": True,
                "is_published": True,
                "sort_order": 3,
            },
        )
        assert updated.status_code == 200, updated.text
        assert updated.json()["quote"] == "Updated quote."
        assert updated.json()["is_published"] is True
        assert [t["name"] for t in client.get("/api/testimonials").json()["items"]] == [
            "Ada Lovelace"
        ]

        archived = client.patch(f"/api/admin/testimonials/{testimonial_id}/archive")
        assert archived.status_code == 200
        assert archived.json()["is_deleted"] is True
        # Archived = invisible everywhere, including the public site.
        assert client.get("/api/testimonials").json()["items"] == []
        assert client.get("/api/admin/testimonials").json()["total"] == 0

        restored = client.patch(f"/api/admin/testimonials/{testimonial_id}/restore")
        assert restored.status_code == 200
        assert restored.json()["is_deleted"] is False
        assert client.get("/api/admin/testimonials").json()["total"] == 1

    def test_unknown_ids_are_404(self, client):
        payload = {"name": "X", "quote": "Y"}
        assert client.put("/api/admin/testimonials/999", json=payload).status_code == 404
        assert client.patch("/api/admin/testimonials/999/archive").status_code == 404
        assert client.patch("/api/admin/testimonials/999/restore").status_code == 404

    def test_validation_rejects_empty_or_odd_values(self, client):
        # name and quote are required and must not be blank
        assert client.post("/api/admin/testimonials", json={"quote": "Hi"}).status_code == 422
        assert (
            client.post("/api/admin/testimonials", json={"name": "X", "quote": ""}).status_code
            == 422
        )
        assert (
            client.post(
                "/api/admin/testimonials", json={"name": "", "quote": "Hi"}
            ).status_code
            == 422
        )
        # negative sort_order is meaningless
        assert (
            client.post(
                "/api/admin/testimonials",
                json={"name": "X", "quote": "Hi", "sort_order": -1},
            ).status_code
            == 422
        )
        # absurdly long quote is rejected rather than stored
        assert (
            client.post(
                "/api/admin/testimonials",
                json={"name": "X", "quote": "q" * 4001},
            ).status_code
            == 422
        )

    def test_requires_admin_session(self, anon_client, customer_client, fake_db: FakeDB):
        row = _seed_testimonial(fake_db)
        assert anon_client.get("/api/admin/testimonials").status_code == 401
        assert customer_client.get("/api/admin/testimonials").status_code == 403

        payload = {"name": "X", "quote": "Y"}
        assert anon_client.post("/api/admin/testimonials", json=payload).status_code == 401
        assert (
            customer_client.post("/api/admin/testimonials", json=payload).status_code == 403
        )
        put = f"/api/admin/testimonials/{row.id}"
        assert anon_client.put(put, json=payload).status_code == 401
        assert customer_client.put(put, json=payload).status_code == 403
        assert anon_client.patch(f"{put}/archive").status_code == 401
        assert customer_client.patch(f"{put}/archive").status_code == 403
        # Nothing was mutated by the rejected calls.
        assert fake_db.store[type(row)][0].name == "Mary Jones"


# ---------------------------------------------------------------------------
# Newsletter capture (Phase 5) — public idempotent signup + admin list/export
# ---------------------------------------------------------------------------
class TestNewsletter:
    def test_subscribe_stores_normalised_row(self, anon_client, fake_db: FakeDB):
        from app.models import NewsletterSubscriber

        resp = anon_client.post("/api/newsletter", json={"email": "Mary@Example.COM"})
        assert resp.status_code == 201, resp.text
        assert "subscribed" in resp.json()["message"].lower()

        rows = fake_db.store[NewsletterSubscriber]
        assert len(rows) == 1
        assert rows[0].email == "mary@example.com"  # lowercased
        assert rows[0].source == "site"  # default source
        assert rows[0].created_at is not None
        assert rows[0].is_deleted is False

    def test_subscribe_records_source(self, anon_client, fake_db: FakeDB):
        from app.models import NewsletterSubscriber

        anon_client.post(
            "/api/newsletter", json={"email": "a@example.com", "source": "checkout"}
        )
        assert fake_db.store[NewsletterSubscriber][0].source == "checkout"

    def test_resubscribe_is_idempotent_and_silent(self, anon_client, fake_db: FakeDB):
        """A signup form must never reveal whether the address is on the list."""
        from app.models import NewsletterSubscriber

        first = anon_client.post("/api/newsletter", json={"email": "dup@example.com"})
        second = anon_client.post("/api/newsletter", json={"email": "DUP@example.com"})
        assert first.status_code == second.status_code == 201
        assert first.json() == second.json()
        assert len(fake_db.store[NewsletterSubscriber]) == 1

    def test_resubscribing_unarchives(self, client, anon_client, fake_db: FakeDB):
        from app.models import NewsletterSubscriber

        anon_client.post("/api/newsletter", json={"email": "back@example.com"})
        subscriber = fake_db.store[NewsletterSubscriber][0]
        client.patch(f"/api/admin/newsletter/{subscriber.id}/archive")
        assert subscriber.is_deleted is True

        again = anon_client.post("/api/newsletter", json={"email": "back@example.com"})
        assert again.status_code == 201
        assert subscriber.is_deleted is False  # re-opted in, not duplicated
        assert len(fake_db.store[NewsletterSubscriber]) == 1

    def test_invalid_email_is_422(self, anon_client, fake_db: FakeDB):
        from app.models import NewsletterSubscriber

        for bad in ("not-an-email", "missing@domain", "@example.com", "a b@example.com"):
            assert (
                anon_client.post("/api/newsletter", json={"email": bad}).status_code == 422
            ), bad
        assert fake_db.store[NewsletterSubscriber] == []

    def test_admin_list_and_archive_restore(self, client, fake_db: FakeDB):
        from app.models import NewsletterSubscriber

        live = fake_db.seed(NewsletterSubscriber, email="live@example.com", source="site")
        gone = fake_db.seed(NewsletterSubscriber, email="gone@example.com", source="site")

        listed = client.get("/api/admin/newsletter").json()
        assert listed["total"] == 2
        assert {i["email"] for i in listed["items"]} == {
            "live@example.com",
            "gone@example.com",
        }
        assert listed["items"][0]["created_at"] is not None

        archived = client.patch(f"/api/admin/newsletter/{gone.id}/archive")
        assert archived.status_code == 200
        assert archived.json()["is_deleted"] is True
        assert client.get("/api/admin/newsletter").json()["total"] == 1

        with_deleted = client.get("/api/admin/newsletter?include_deleted=true").json()
        assert live.id in [i["id"] for i in with_deleted["items"]]

        restored = client.patch(f"/api/admin/newsletter/{gone.id}/restore")
        assert restored.status_code == 200
        assert client.get("/api/admin/newsletter").json()["total"] == 2

        assert client.patch("/api/admin/newsletter/999/archive").status_code == 404
        assert client.patch("/api/admin/newsletter/999/restore").status_code == 404

    def test_export_csv_suppresses_archived(self, client, fake_db: FakeDB):
        from app.models import NewsletterSubscriber

        fake_db.seed(NewsletterSubscriber, email="live@example.com", source="site")
        gone = fake_db.seed(NewsletterSubscriber, email="gone@example.com", source="site")
        client.patch(f"/api/admin/newsletter/{gone.id}/archive")

        resp = client.get("/api/admin/newsletter/export")
        assert resp.status_code == 200, resp.text
        assert resp.headers["content-type"].startswith("text/csv")
        assert "newsletter-subscribers.csv" in resp.headers["content-disposition"]
        lines = resp.text.splitlines()
        assert lines[0] == "id,email,source,created_at"
        assert "live@example.com" in lines[1]
        # Archived subscribers are suppressed unless explicitly requested.
        assert "gone@example.com" not in resp.text
        everything = client.get("/api/admin/newsletter/export?include_deleted=true")
        assert "gone@example.com" in everything.text

    def test_requires_admin_session(self, anon_client, customer_client, fake_db: FakeDB):
        from app.models import NewsletterSubscriber

        row = fake_db.seed(NewsletterSubscriber, email="a@example.com", source="site")
        for path in ("/api/admin/newsletter", "/api/admin/newsletter/export"):
            assert anon_client.get(path).status_code == 401, path
            assert customer_client.get(path).status_code == 403, path
        for suffix in ("archive", "restore"):
            path = f"/api/admin/newsletter/{row.id}/{suffix}"
            assert anon_client.patch(path).status_code == 401, path
            assert customer_client.patch(path).status_code == 403, path
        assert row.is_deleted is False



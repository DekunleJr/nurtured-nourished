"""Phase 3 e2e: register -> list eligible cohorts -> checkout -> bookings."""
import json
import urllib.request
import uuid
from datetime import date, timedelta

BASE = "http://127.0.0.1:8000"


def call(method, path, payload=None, cookie=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if cookie:
        req.add_header("Cookie", cookie)
    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode() or "{}")
            return resp.status, body, resp.headers.get("Set-Cookie", "")
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read().decode() or "{}"), ""


email = f"e2e-{uuid.uuid4().hex[:8]}@example.com"
due = (date.today() + timedelta(days=300)).isoformat()

status, body, set_cookie = call(
    "POST",
    "/api/auth/register",
    {"name": "E2E Buyer", "email": email, "due_date": due, "phone": "07700900000", "password": "Str0ngPass!"},
)
print("REGISTER", status, body if status != 200 else body.get("email"))
cookie = set_cookie.split(";")[0]
print("COOKIE", cookie[:40], "...")

status, body, _ = call("POST", "/api/auth/login", {"email": email, "password": "Str0ngPass!"})
print("LOGIN", status, body.get("role"))

status, body, _ = call("GET", "/api/packages")
packages = body if isinstance(body, list) else body.get("items", [])
pid = packages[0]["id"] if packages else None
print("PACKAGES", status, [(p["id"], p.get("slug"), p.get("price_pence")) for p in packages][:3])

status, body, _ = call("GET", f"/api/me/cohorts?package_id={pid}", cookie=cookie)
cohorts = body.get("items", [])
print("COHORTS", status, "due:", body.get("due_date"))
for c in cohorts[:5]:
        print("  cohort", c["id"], c["label"], c["start_date"], "->", c["end_date"], "cat", c["category"], "seats", c["seats_left"], "plans", [(p["code"], p.get("amounts_pence"), p.get("summary")) for p in c["plans"]])

if cohorts:
    target = cohorts[0]
    plan = target["plans"][0]
    status, body, _ = call(
        "POST",
        "/api/me/checkout",
        {"package_id": pid, "cohort_id": target["id"], "plan_code": plan["code"]},
        cookie=cookie,
    )
    print("CHECKOUT", status)
    if status in (200, 201):
        print("  ref", body["reference"], "status", body["status"], "plan", body["payment_plan"], "url?", bool(body.get("checkout_url")))
        for i in body["instalments"]:
            print("    instalment", i["sequence"], i["amount_pence"], i["due_date"], i["status"])
        ref = body["reference"]
        status, body, _ = call("GET", "/api/me/bookings", cookie=cookie)
        print("MY BOOKINGS", status, len(body.get("items", [])))
        status, body, _ = call("GET", f"/api/me/bookings/{ref}", cookie=cookie)
        print("BOOKING DETAIL", status, body.get("status"), body.get("next_instalment") and body["next_instalment"]["sequence"])
    else:
        print("  error", body)

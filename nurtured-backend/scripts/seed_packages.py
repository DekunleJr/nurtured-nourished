#!/usr/bin/env python
"""Seed the approved Nurtured & Nourished package catalogue.

Run from the backend root:
    .venv/Scripts/python.exe scripts/seed_packages.py

Idempotent — safe to run more than once. Existing packages (matched by slug)
are re-printed; set OVERWRITE=True below to replace their data on re-runs.

This writes directly to the database; the /api/admin/packages POST endpoint is
the future admin path and is not used by this script.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import SessionLocal
from app.models import ProgrammePackage

# Set to True to replace an existing row's data when the slug matches.
# False leaves existing rows untouched (review / diff mode).
OVERWRITE = True

INSTALMENT_NOTE = (
    "Pay in full or spread the cost with interest-free instalments where available."
)

CORE_FEATURES = [
    "Complete six-week live online FOBCP™",
    "Maximum of five women per cohort",
    "Birth partner or chosen supporter welcome",
    "Premium FOBCP™ programme resources",
    "WhatsApp Programme Support during the six-week programme",
]

REUNION_FEATURE = (
    "Invitation to the optional cohort Postnatal Reunion, where scheduled"
)


def features_for_tier(tier: str) -> list[str]:
    session_count = {
        "foundation": "1 × 45-minute private online postnatal support session",
        "continuity": "2 × 45-minute private online postnatal support sessions",
        "extended": "3 × 45-minute private online postnatal support sessions",
    }[tier]
    window = {
        "foundation": "Postnatal session available within your first 6 weeks after birth",
        "continuity": "Postnatal sessions available within your first 12 weeks after birth",
        "extended": "Postnatal sessions available within your first 6 months after birth",
    }[tier]
    return CORE_FEATURES + [session_count, window, REUNION_FEATURE]


PACKAGES = [
    {
        "slug": "foundation",
        "name": "Maternal Foundation",
        "tagline": "A strong beginning.",
        "price_pence": 29500,
        "currency": "gbp",
        "blurb": (
            "The complete FOBCP™ experience, followed by a private postnatal "
            "support session during your first six weeks after birth."
        ),
        "price_note": INSTALMENT_NOTE,
        "cta_label": "Choose Maternal Foundation",
        "is_featured": False,
        "sort_order": 1,
    },
    {
        "slug": "continuity",
        "name": "Maternal Continuity",
        "tagline": "More time for individual support.",
        "price_pence": 34500,
        "currency": "gbp",
        "blurb": (
            "The complete FOBCP™ experience with two private postnatal support "
            "sessions available across your first 12 weeks after birth."
        ),
        "price_note": INSTALMENT_NOTE,
        "cta_label": "Choose Maternal Continuity",
        "is_featured": True,
        "sort_order": 2,
    },
    {
        "slug": "extended",
        "name": "Maternal Extended",
        "tagline": "Support that stays with you for longer.",
        "price_pence": 39500,
        "currency": "gbp",
        "blurb": (
            "The complete FOBCP™ experience with three private postnatal support "
            "sessions that can be used across your first six months after birth."
        ),
        "price_note": INSTALMENT_NOTE,
        "cta_label": "Choose Maternal Extended",
        "is_featured": False,
        "sort_order": 3,
    },
]


def main() -> None:
    inserted = 0
    skipped = 0

    with SessionLocal() as db:
        for pkg in PACKAGES:
            existing = (
                db.query(ProgrammePackage)
                .filter(ProgrammePackage.slug == pkg["slug"])
                .one_or_none()
            )
            if existing is None:
                row = ProgrammePackage(
                    **pkg,
                    features=features_for_tier(pkg["slug"]),
                )
                db.add(row)
                db.flush()
                print(f"created   {pkg['slug']:12s}  id={row.id}")
                inserted += 1
            else:
                if OVERWRITE:
                    existing.name = pkg["name"]
                    existing.tagline = pkg["tagline"]
                    existing.price_pence = pkg["price_pence"]
                    existing.currency = pkg["currency"]
                    existing.blurb = pkg["blurb"]
                    existing.features = features_for_tier(pkg["slug"])
                    existing.price_note = pkg["price_note"]
                    existing.cta_label = pkg["cta_label"]
                    existing.is_featured = pkg["is_featured"]
                    existing.sort_order = pkg["sort_order"]
                    existing.is_published = True
                    existing.is_deleted = False
                    db.flush()
                    print(f"updated   {pkg['slug']:12s}  id={existing.id}")
                    inserted += 1
                else:
                    print(
                        f"unchanged {pkg['slug']:12s}  id={existing.id}  "
                        f"(set OVERWRITE=True to replace)"
                    )
                    skipped += 1
        db.commit()

    total = inserted + skipped
    print(f"\nDone. {inserted} package(s) written to the catalogue, "
          f"{skipped} already present and skipped.")
    print(f"Catalogue rows reviewed: {total}.")
    print("Public endpoint: GET /api/packages  —  "
          "Admin endpoint: GET/POST /api/admin/packages")


if __name__ == "__main__":
    main()
"""Seed dev cohorts across the three plan categories for the e2e smoke test."""
from datetime import date, timedelta

from app.database import SessionLocal
from app.models import Cohort

db = SessionLocal()
if db.query(Cohort).count() == 0:
    today = date.today()
    db.add_all(
        [
            Cohort(label="May Dev Cohort A", start_date=today + timedelta(days=70), capacity=5, session_time="Tue 18:00", status="open"),
            Cohort(label="May Dev Cohort B", start_date=today + timedelta(days=42), capacity=5, session_time="Wed 10:00", status="open"),
            Cohort(label="May Dev Cohort C", start_date=today + timedelta(days=20), capacity=5, session_time="Thu 19:00", status="open"),
            Cohort(label="May Dev Cohort A2", start_date=today + timedelta(days=90), capacity=5, session_time="Mon 17:00", status="open"),
        ]
    )
    db.commit()
    print("seeded 4 cohorts")
else:
    print("cohorts already exist")
rows = db.query(Cohort).all()
for c in rows:
    print(c.id, c.label, c.start_date, "cat-end", c.end_date, c.capacity, c.status)
db.close()

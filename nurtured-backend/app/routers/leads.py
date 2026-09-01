from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Lead
from ..schemas import LeadCreate

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post("", status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    try:
        row = Lead(
            organisation=payload.organisation,
            contact_name=payload.contact_name,
            job_title=payload.job_title,
            email=payload.email,
            goals=payload.goals,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"id": row.id, "status": "received"}
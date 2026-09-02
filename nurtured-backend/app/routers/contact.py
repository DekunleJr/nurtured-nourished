from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ContactMessage
from ..rate_limit import limiter
from ..schemas import ContactCreate

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", status_code=201)
@limiter.limit("5/minute")
def create_contact(request: Request, payload: ContactCreate, db: Session = Depends(get_db)):
    try:
        row = ContactMessage(
            name=payload.name,
            email=payload.email,
            subject=payload.subject,
            message=payload.message,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"id": row.id, "status": "received"}

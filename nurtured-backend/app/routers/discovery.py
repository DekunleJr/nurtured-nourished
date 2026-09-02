from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import DiscoveryIntake
from ..rate_limit import limiter
from ..schemas import DiscoveryIntakeCreate

router = APIRouter(prefix="/api/discovery-intake", tags=["discovery-intake"])


@router.post("", status_code=201)
@limiter.limit("5/minute")
def create_intake(request: Request, payload: DiscoveryIntakeCreate, db: Session = Depends(get_db)):
    try:
        row = DiscoveryIntake(
            name=payload.name,
            email=payload.email,
            due_date=payload.due_date,
            postcode=payload.postcode,
            package=payload.package,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"id": row.id, "status": "received"}

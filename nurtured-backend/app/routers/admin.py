from datetime import datetime
from typing import List, Dict, Any

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ContactMessage, DiscoveryIntake, Lead
from ..utils.auth import AdminLoginRequest, authenticate_admin, create_token, verify_token

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- Pydantic Response Models ---
class LeadResponse(BaseModel):
    id: int
    organisation: str
    contact_name: str
    email: str
    goals: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

class DiscoveryResponse(BaseModel):
    id: int
    name: str
    email: str
    due_date: str
    postcode: str
    package: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

class DashboardResponse(BaseModel):
    leads: List[Dict[str, Any]]
    discovery: List[Dict[str, Any]]
    contacts: List[Dict[str, Any]]
    stats: Dict[str, int]

# --- Routes ---
@router.post("/auth")
async def login(response: Response, login_data: AdminLoginRequest):
    """Authenticate with username/password (JSON body) and receive a session cookie."""
    username = authenticate_admin(login_data)
    token = create_token(username)

    response.set_cookie(
        key="admin-session",
        value=token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=28800,
        path="/",
    )

    return {"message": "Authenticated", "username": username, "token": token}

@router.post("/logout")
async def logout(response: Response):
    """Clear the admin session cookie."""
    response.delete_cookie("admin-session")
    return {"message": "Logged out"}

@router.get("/verify")
async def verify_session(response: Response, request: Request):
    """Verify the current session cookie."""
    session = request.cookies.get("admin-session")
    if not session:
        return {"valid": False}
    try:
        verify_token(session)
        return {"valid": True}
    except Exception:
        return {"valid": False}

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_data(
    request: Request,
    db: Session = Depends(get_db),
):
    """Return all submissions across leads, discovery intake, and contact messages."""
    session = request.cookies.get("admin-session")
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        verify_token(session)
    except Exception:
        raise HTTPException(status_code=401, detail="Not authenticated")

    leads = db.query(Lead).filter(Lead.is_deleted == False).all()
    discovery = db.query(DiscoveryIntake).filter(
        DiscoveryIntake.is_deleted == False
    ).all()
    contacts = db.query(ContactMessage).filter(
        ContactMessage.is_deleted == False
    ).all()

    return {
        "leads": [
            {
                "id": lead.id,
                "organisation": lead.organisation,
                "contact_name": lead.contact_name,
                "email": lead.email,
                "goals": lead.goals,
                "created_at": lead.created_at.isoformat(),
                "updated_at": lead.updated_at.isoformat(),
                "is_deleted": lead.is_deleted,
            }
            for lead in leads
        ],
        "discovery": [
            {
                "id": d.id,
                "name": d.name,
                "email": d.email,
                "due_date": d.due_date,
                "postcode": d.postcode,
                "package": d.package,
                "created_at": d.created_at.isoformat(),
                "updated_at": d.updated_at.isoformat(),
                "is_deleted": d.is_deleted,
            }
            for d in discovery
        ],
        "contacts": [
            {
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "subject": c.subject,
                "message": c.message,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat(),
                "is_deleted": c.is_deleted,
            }
            for c in contacts
        ],
        "stats": {
            "total_leads": len(leads),
            "total_discovery": len(discovery),
            "total_contacts": len(contacts),
        },
    }

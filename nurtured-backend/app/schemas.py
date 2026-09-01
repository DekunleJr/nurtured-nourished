from pydantic import BaseModel, Field

_EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class LeadCreate(BaseModel):
    organisation: str = Field(..., min_length=1, max_length=255)
    contact_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    goals: str = Field(default="", max_length=4000)


class DiscoveryIntakeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    due_date: str = Field(..., min_length=1, max_length=32)
    postcode: str = Field(..., min_length=1, max_length=16)
    package: str = Field(..., min_length=1, max_length=64)
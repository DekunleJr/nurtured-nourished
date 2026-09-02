import re
from pydantic import BaseModel, Field, field_validator

_EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

_HTML_PATTERN = re.compile(r"<[^>]*>")


def _strip_html(value: str) -> str:
    """Remove HTML tags to prevent XSS."""
    return _HTML_PATTERN.sub("", value)


class LeadCreate(BaseModel):
    organisation: str = Field(..., min_length=1, max_length=255)
    contact_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    goals: str = Field(default="", max_length=4000)

    @field_validator("organisation", "contact_name", "job_title", "goals")
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        return _strip_html(v)


class DiscoveryIntakeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    due_date: str = Field(..., min_length=1, max_length=32)
    postcode: str = Field(..., min_length=1, max_length=16)
    package: str = Field(..., min_length=1, max_length=64)

    @field_validator("name", "package")
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        return _strip_html(v)


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=_EMAIL_PATTERN, max_length=255)
    subject: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=4000)

    @field_validator("name", "subject", "message")
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        return _strip_html(v)

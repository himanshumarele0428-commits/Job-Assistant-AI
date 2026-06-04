from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class JobCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    company_website: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_range: Optional[str] = None
    experience_required: Optional[str] = None
    description: Optional[str] = None
    skills_required: Optional[List[str]] = None
    application_url: Optional[str] = None
    resume_id: Optional[str] = None
    cover_letter_id: Optional[str] = None
    status: Optional[str] = "draft"
    date_applied: Optional[date] = None
    notes: Optional[str] = None


class JobUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    company_website: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_range: Optional[str] = None
    experience_required: Optional[str] = None
    description: Optional[str] = None
    skills_required: Optional[List[str]] = None
    application_url: Optional[str] = None
    resume_id: Optional[str] = None
    cover_letter_id: Optional[str] = None
    status: Optional[str] = None
    date_applied: Optional[date] = None
    notes: Optional[str] = None


class JobResponse(BaseModel):
    id: str
    user_id: str
    title: str
    company: str
    company_website: Optional[str]
    location: Optional[str]
    employment_type: Optional[str]
    work_mode: Optional[str]
    salary_range: Optional[str]
    experience_required: Optional[str]
    description: Optional[str]
    skills_required: Optional[List[str]]
    application_url: Optional[str]
    resume_id: Optional[str]
    cover_letter_id: Optional[str]
    status: str
    date_applied: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[JobResponse]

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CoverLetterGenerateRequest(BaseModel):
    resume_id: str
    jd_text: str = Field(..., min_length=10)
    company_name: str
    hiring_manager: Optional[str] = None
    job_id: Optional[str] = None
    api_key: str


class CoverLetterResponse(BaseModel):
    id: str
    user_id: str
    resume_id: str
    job_id: Optional[str]
    company_name: str
    hiring_manager: Optional[str]
    content: Optional[str]
    file_path_pdf: Optional[str]
    file_path_docx: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

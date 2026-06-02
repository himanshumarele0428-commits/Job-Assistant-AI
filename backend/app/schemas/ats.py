from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ATSAnalyzeRequest(BaseModel):
    resume_id: str = None
    jd_text: str = Field(..., min_length=10)
    job_id: str | None = None
    api_key: str


class ATSAnalysisResponse(BaseModel):
    id: str
    user_id: str
    resume_id: str
    job_id: Optional[str]
    overall_score: Optional[float]
    scores: Optional[dict]
    keyword_analysis: Optional[dict]
    detailed_feedback: Optional[dict]
    summary: Optional[str]
    ats_readability_score: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}

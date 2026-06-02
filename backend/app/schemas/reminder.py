from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReminderCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    reminder_type: str = Field(..., pattern="^(interview|follow-up|deadline)$")
    scheduled_at: datetime
    notification_type: str = Field(default="email", pattern="^(email|in-app)$")
    job_id: Optional[str] = None


class ReminderUpdateRequest(BaseModel):
    title: Optional[str] = None
    reminder_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    notification_type: Optional[str] = None


class ReminderResponse(BaseModel):
    id: str
    user_id: str
    job_id: Optional[str]
    title: str
    reminder_type: str
    scheduled_at: datetime
    is_sent: bool
    notification_type: str
    created_at: datetime

    model_config = {"from_attributes": True}

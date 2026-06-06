from pydantic import BaseModel, Field, field_serializer
from typing import Optional
from datetime import datetime, timezone


class ReminderCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    reminder_type: str = Field(..., pattern="^(interview|follow-up|deadline)$")
    scheduled_at: datetime
    notification_type: str = Field(default="email", pattern="^(email|in-app)$")
    recipient_email: Optional[str] = None
    job_id: Optional[str] = None


class ReminderUpdateRequest(BaseModel):
    title: Optional[str] = None
    reminder_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    notification_type: Optional[str] = None
    recipient_email: Optional[str] = None


class ReminderResponse(BaseModel):
    id: str
    user_id: str
    job_id: Optional[str]
    title: str
    reminder_type: str
    scheduled_at: datetime
    is_sent: bool
    notification_type: str
    recipient_email: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer('scheduled_at', 'created_at')
    def serialize_dt_utc(self, dt: datetime, _info):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

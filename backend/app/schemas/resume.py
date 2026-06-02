from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    name: str
    version: int
    file_path: Optional[str]
    file_type: Optional[str]
    extracted_text: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

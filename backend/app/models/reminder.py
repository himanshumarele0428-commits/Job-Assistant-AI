import uuid
from datetime import datetime
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def uuid_pk():
    return str(uuid.uuid4())


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=uuid_pk)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id"))
    title = Column(String(255), nullable=False)
    reminder_type = Column(String(30), nullable=False)
    scheduled_at = Column(DateTime, nullable=False, index=True)
    is_sent = Column(Boolean, default=False)
    notification_type = Column(String(20), default="email")
    recipient_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reminders")
    job = relationship("Job")

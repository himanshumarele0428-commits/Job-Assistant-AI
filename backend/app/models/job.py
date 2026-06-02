import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


def uuid_pk():
    return str(uuid.uuid4())


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=uuid_pk)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    company_website = Column(String(500))
    location = Column(String(255))
    employment_type = Column(String(50))
    work_mode = Column(String(20))
    salary_range = Column(String(100))
    experience_required = Column(String(100))
    description = Column(Text)
    skills_required = Column(JSON)
    application_url = Column(String(500))
    resume_id = Column(String(36), ForeignKey("resumes.id"))
    cover_letter_id = Column(String(36), ForeignKey("cover_letters.id"))
    status = Column(String(30), default="draft", index=True)
    date_applied = Column(Date, default=date.today)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="jobs")
    resume = relationship("Resume", foreign_keys=[resume_id])
    cover_letter = relationship("CoverLetter", foreign_keys=[cover_letter_id])

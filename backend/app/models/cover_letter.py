from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
import uuid
from sqlalchemy.orm import relationship
from app.database import Base


def uuid_pk():
    return str(uuid.uuid4())


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(String(36), primary_key=True, default=uuid_pk)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"))
    company_name = Column(String(255), nullable=False)
    hiring_manager = Column(String(255))
    jd_text = Column(Text, nullable=False)
    content = Column(Text)
    file_path_pdf = Column(String(500))
    file_path_docx = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="cover_letters")
    resume = relationship("Resume", foreign_keys=[resume_id])
    job = relationship("Job", foreign_keys=[job_id])

import uuid
from datetime import datetime
from sqlalchemy import Column, Text, Float, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import relationship
from app.database import Base


def uuid_pk():
    return str(uuid.uuid4())


class ATSAnalysis(Base):
    __tablename__ = "ats_analyses"

    id = Column(String(36), primary_key=True, default=uuid_pk)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"))
    jd_text = Column(Text, nullable=False)
    overall_score = Column(Float)
    scores = Column(JSON)
    keyword_analysis = Column(JSON)
    detailed_feedback = Column(JSON)
    summary = Column(Text)
    ats_readability_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ats_analyses")
    resume = relationship("Resume", back_populates="ats_analyses", foreign_keys=[resume_id])
    job = relationship("Job", foreign_keys=[job_id])

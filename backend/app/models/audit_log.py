import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
import uuid
from sqlalchemy.orm import relationship
from app.database import Base


def uuid_pk():
    return str(uuid.uuid4())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=uuid_pk)
    user_id = Column(String(36), ForeignKey("users.id"), index=True)
    action = Column(String(100), nullable=False)
    details = Column(JSON)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")

from sqlalchemy import Column, String, Float, Text, JSON, DateTime
from datetime import datetime
import uuid
from app.db.base import Base

class ReviewCase(Base):
    __tablename__ = "review_cases"

    case_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), index=True, nullable=False)
    discharge_id = Column(String(36), index=True, nullable=True)
    task_id = Column(String(36), index=True, nullable=True)
    
    reason = Column(String(255), nullable=False) # e.g. "Medication ambiguity", "Missing date", "Dose clarification"
    original_instruction = Column(Text, nullable=False)
    ai_interpretation = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.5)
    priority = Column(String(20), default="HIGH") # HIGH | MEDIUM | LOW
    resolution_status = Column(String(50), default="OPEN") # OPEN | RESOLVED | REJECTED | ESCALATED
    
    reviewer_notes = Column(Text, nullable=True)
    resolved_values = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, Float
from datetime import datetime
import uuid
from app.db.base import Base

class CareTask(Base):
    __tablename__ = "care_tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), index=True, nullable=False)
    discharge_id = Column(String(36), index=True, nullable=True)
    
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False) # Appointment | Test | Medication | Referral | Care
    due_date = Column(String(50), nullable=False) # YYYY-MM-DD or timeframe
    status = Column(String(50), default="Pending") # Pending | Completed | Needs Review
    action_type = Column(String(100), default="General Action")
    confidence_score = Column(Float, default=0.88)
    
    # Provenance
    source_page = Column(Integer, default=1)
    source_text = Column(Text, nullable=True)
    clarification_needed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

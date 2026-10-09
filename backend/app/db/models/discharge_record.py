from sqlalchemy import Column, String, Integer, Text, JSON, DateTime
from datetime import datetime
import uuid
from app.db.base import Base

class DischargeRecord(Base):
    __tablename__ = "discharge_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), index=True, default=lambda: str(uuid.uuid4()))
    patient_name = Column(String(255), default="Synthetic Patient")
    discharge_date = Column(String(50), default="2026-10-08")
    filename = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=True)
    language_preference = Column(String(10), default="en")
    
    # State Machine Status
    status = Column(String(50), default="PROCESSING") # PROCESSING, COMPLETED, FAILED
    current_step = Column(String(100), default="DOCUMENT_UPLOADED")
    progress_percentage = Column(Integer, default=10)
    steps_status = Column(JSON, default=dict)
    
    # Extracted Data & Care Plan
    care_instructions = Column(JSON, default=list)
    warning_signs = Column(JSON, default=dict)
    error = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

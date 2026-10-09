from sqlalchemy import Column, String, Float, Boolean, DateTime
from datetime import datetime
import uuid
from app.db.base import Base

class CareProvider(Base):
    __tablename__ = "care_providers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    specialty = Column(String(100), nullable=False)
    facility_type = Column(String(100), default="Clinic") # Clinic | Hospital | Diagnostic Lab
    address = Column(String(255), nullable=False)
    location = Column(String(100), default="Metro City")
    distance_km = Column(Float, default=2.5)
    rating = Column(Float, default=4.8)
    contact_synthetic = Column(String(50), default="+1-555-010-0000")
    accepts_insurance = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

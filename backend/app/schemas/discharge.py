from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class DischargeUploadResponse(BaseModel):
    discharge_id: str
    patient_id: str
    patient_name: Optional[str] = None
    status: str = "PROCESSING"
    message: str = "Document queued for extraction and timeline generation"
    created_at: datetime

class StepsStatusMap(BaseModel):
    document_uploaded: str = "COMPLETED"
    extracting_instructions: str = "PENDING"
    identifying_followup_actions: str = "PENDING"
    checking_dates: str = "PENDING"
    creating_care_timeline: str = "PENDING"
    checking_for_unclear_instructions: str = "PENDING"
    preparing_care_plan: str = "PENDING"

class DischargeStatusResponse(BaseModel):
    discharge_id: str
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    current_step: str
    progress_percentage: int
    steps_status: Dict[str, str]
    error: Optional[str] = None

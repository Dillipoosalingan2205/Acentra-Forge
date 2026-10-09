from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SourceCitation(BaseModel):
    page: int = 1
    raw_quote: str

class PlanMetrics(BaseModel):
    total_actions: int = 0
    pending: int = 0
    completed: int = 0
    needs_review: int = 0

class UpcomingAction(BaseModel):
    task_id: str
    title: str
    due_date: str
    category: str # Appointment | Medication | Test | Care
    status: str = "Pending"

class CareInstructionItem(BaseModel):
    id: str
    category: str # Wound Care | Activity | Diet | General
    original_text: str
    simplified_text: str
    confidence: float = 0.88
    language: str = "en"
    source_citation: SourceCitation

class WarningSignsInfo(BaseModel):
    disclaimer: str = (
        "This information is reproduced directly from your discharge instructions. "
        "The AI does not diagnose symptoms or provide medical advice."
    )
    confidence: float = 0.89
    when_to_seek_immediate_care: List[str]
    source_citation: SourceCitation

class PatientCarePlanResponse(BaseModel):
    patient_id: str
    patient_name: str
    discharge_date: str
    metrics: PlanMetrics
    next_upcoming_action: Optional[UpcomingAction] = None
    care_instructions: List[CareInstructionItem] = []
    warning_signs: WarningSignsInfo

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReviewCaseItem(BaseModel):
    case_id: str
    patient_id: str
    reason: str
    original_instruction: str
    ai_interpretation: str
    confidence_score: float
    priority: str # HIGH | MEDIUM | LOW
    created_at: datetime

class ReviewQueueResponse(BaseModel):
    review_cases: List[ReviewCaseItem]

class ResolvedValues(BaseModel):
    due_date: Optional[str] = None
    override_instruction: Optional[str] = None

class ReviewResolutionRequest(BaseModel):
    action: str # APPROVE | REJECT | OVERRIDE | REQUEST_CLARIFICATION
    reviewer_notes: str
    resolved_values: Optional[ResolvedValues] = None

class ReviewResolutionResponse(BaseModel):
    case_id: str
    resolution_status: str
    reviewer_notes: str
    updated_task_id: Optional[str] = None

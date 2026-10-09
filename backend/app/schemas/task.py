from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TaskItem(BaseModel):
    id: str
    title: str
    category: str # Appointment | Test | Medication | Referral | Care
    due_date: str
    status: str # Pending | Completed | Needs Review
    action_type: str = "Follow-up"
    confidence_score: float = 0.88
    source_page: int = 1
    source_text: str = ""
    clarification_needed: bool = False

class TaskListResponse(BaseModel):
    tasks: List[TaskItem]

class TaskUpdateRequest(BaseModel):
    status: str # Pending | Completed | Needs Review
    notes: Optional[str] = None

class TaskUpdateResponse(BaseModel):
    id: str
    updated_status: str
    updated_at: datetime

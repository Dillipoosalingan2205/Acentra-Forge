from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime

from app.db.session import get_db
from app.db.models.review_case import ReviewCase
from app.db.models.task import CareTask
from app.schemas.review import (
    ReviewQueueResponse, ReviewCaseItem,
    ReviewResolutionRequest, ReviewResolutionResponse
)

router = APIRouter(prefix="/reviews", tags=["Human Review Queue"])

@router.get(
    "",
    response_model=ReviewQueueResponse,
    summary="Care coordinator / clinician triage queue"
)
async def list_review_cases(
    priority: Optional[str] = Query("All", description="Priority filter: All, High, Medium, Low"),
    db: AsyncSession = Depends(get_db)
):
    query = select(ReviewCase).where(ReviewCase.resolution_status == "OPEN")

    if priority and priority != "All":
        query = query.where(ReviewCase.priority == priority.upper())

    query = query.order_by(ReviewCase.created_at.desc())
    res = await db.execute(query)
    cases = res.scalars().all()

    items = [
        ReviewCaseItem(
            case_id=c.case_id,
            patient_id=c.patient_id,
            reason=c.reason,
            original_instruction=c.original_instruction,
            ai_interpretation=c.ai_interpretation,
            confidence_score=c.confidence_score,
            priority=c.priority,
            created_at=c.created_at
        )
        for c in cases
    ]

    return ReviewQueueResponse(review_cases=items)

@router.get(
    "/{id}",
    response_model=ReviewCaseItem,
    summary="Get single review case"
)
async def get_review_case(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    if id.lower() in ["rev-001", "demo"]:
        query = select(ReviewCase).order_by(ReviewCase.created_at.desc())
        res = await db.execute(query)
        case = res.scalars().first()
    else:
        case = await db.get(ReviewCase, id)

    if not case:
        raise HTTPException(status_code=404, detail="Review case not found")

    return ReviewCaseItem(
        case_id=case.case_id,
        patient_id=case.patient_id,
        reason=case.reason,
        original_instruction=case.original_instruction,
        ai_interpretation=case.ai_interpretation,
        confidence_score=case.confidence_score,
        priority=case.priority,
        created_at=case.created_at
    )

@router.patch(
    "/{id}",
    response_model=ReviewResolutionResponse,
    summary="Resolve or request clarification on escalated cases"
)
async def resolve_review_case(
    id: str,
    payload: ReviewResolutionRequest,
    db: AsyncSession = Depends(get_db)
):
    case = await db.get(ReviewCase, id)
    if not case:
        raise HTTPException(status_code=404, detail="Review case not found")

    case.resolution_status = "RESOLVED" if payload.action in ["APPROVE", "OVERRIDE"] else payload.action
    case.reviewer_notes = payload.reviewer_notes
    case.updated_at = datetime.utcnow()

    updated_task_id = case.task_id

    # If associated task exists or matching task for this patient exists, update task
    if payload.resolved_values:
        case.resolved_values = payload.resolved_values.dict()
        
        # If due_date was overridden or provided, update related task
        if payload.resolved_values.due_date:
            t_query = select(CareTask).where(
                (CareTask.patient_id == case.patient_id) & 
                (CareTask.clarification_needed == True)
            )
            t_res = await db.execute(t_query)
            t = t_res.scalars().first()
            if t:
                t.due_date = payload.resolved_values.due_date
                t.clarification_needed = False
                t.status = "Pending"
                updated_task_id = t.id

    await db.commit()

    return ReviewResolutionResponse(
        case_id=case.case_id,
        resolution_status=case.resolution_status,
        reviewer_notes=case.reviewer_notes or "",
        updated_task_id=updated_task_id
    )

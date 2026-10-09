from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime
import re

from app.db.session import get_db
from app.db.models.review_case import ReviewCase
from app.db.models.task import CareTask
from app.db.models.discharge_record import DischargeRecord
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
    patient_id: Optional[str] = Query(None, description="Optional patient ID filter"),
    db: AsyncSession = Depends(get_db)
):
    query = select(ReviewCase).where(ReviewCase.resolution_status == "OPEN")

    if priority and priority != "All":
        query = query.where(ReviewCase.priority == priority.upper())

    if patient_id and patient_id != "All" and patient_id.lower() != "demo":
        query = query.where(ReviewCase.patient_id == patient_id)

    query = query.order_by(ReviewCase.created_at.desc())
    res = await db.execute(query)
    cases = res.scalars().all()

    p_ids = [c.patient_id for c in cases]
    p_names = {}
    if p_ids:
        d_res = await db.execute(
            select(DischargeRecord.patient_id, DischargeRecord.patient_name)
            .where(DischargeRecord.patient_id.in_(p_ids))
        )
        for row in d_res.all():
            if row[0]:
                p_names[row[0]] = row[1]

    items = [
        ReviewCaseItem(
            case_id=c.case_id,
            patient_id=c.patient_id,
            patient_name=p_names.get(c.patient_id, "Synthetic Patient"),
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

    p_name = "Synthetic Patient"
    d_res = await db.execute(
        select(DischargeRecord.patient_name).where(DischargeRecord.patient_id == case.patient_id)
    )
    d_name = d_res.scalars().first()
    if d_name:
        p_name = d_name

    return ReviewCaseItem(
        case_id=case.case_id,
        patient_id=case.patient_id,
        patient_name=p_name,
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

    if payload.resolved_values:
        case.resolved_values = payload.resolved_values.dict()

    if payload.action in ["APPROVE", "OVERRIDE"]:
        tasks_to_update = []
        if case.task_id:
            t_res = await db.execute(select(CareTask).where(CareTask.id == case.task_id))
            t = t_res.scalars().first()
            if t:
                tasks_to_update.append(t)

        if not tasks_to_update:
            t_res = await db.execute(
                select(CareTask).where(
                    ((CareTask.patient_id == case.patient_id) | (CareTask.discharge_id == case.discharge_id)) &
                    ((CareTask.clarification_needed == True) | (CareTask.status.in_(["Needs Review", "needs-review"])))
                )
            )
            tasks_to_update = list(t_res.scalars().all())

        if not tasks_to_update:
            t_res = await db.execute(
                select(CareTask).where(
                    (CareTask.patient_id == case.patient_id) | (CareTask.discharge_id == case.discharge_id)
                )
            )
            all_patient_tasks = list(t_res.scalars().all())
            case_keywords = set(re.findall(r'[a-zA-Z]{4,}', (case.original_instruction or '').lower()))
            best_match = None
            best_score = 0
            for pt in all_patient_tasks:
                pt_text = f"{pt.title} {pt.source_text} {pt.category}".lower()
                overlap = sum(1 for kw in case_keywords if kw in pt_text)
                if overlap > best_score:
                    best_score = overlap
                    best_match = pt
            if best_match and best_score >= 1:
                tasks_to_update.append(best_match)

        for t in tasks_to_update:
            t.clarification_needed = False
            t.status = "Pending"
            if t.confidence_score is None or t.confidence_score < 0.85:
                t.confidence_score = 0.90
            note_msg = f"Clinician review ({payload.action}): {payload.reviewer_notes}" if payload.reviewer_notes else f"Verified by clinician ({payload.action})"
            t.notes = f"{t.notes} | {note_msg}" if t.notes else note_msg

            if payload.resolved_values:
                if payload.resolved_values.due_date:
                    t.due_date = payload.resolved_values.due_date
                if payload.resolved_values.override_instruction:
                    t.title = payload.resolved_values.override_instruction

            updated_task_id = t.id
            if not case.task_id:
                case.task_id = t.id

    await db.commit()

    return ReviewResolutionResponse(
        case_id=case.case_id,
        resolution_status=case.resolution_status,
        reviewer_notes=case.reviewer_notes or "",
        updated_task_id=updated_task_id
    )

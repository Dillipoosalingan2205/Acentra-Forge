from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.db.session import get_db
from app.db.models.discharge_record import DischargeRecord
from app.db.models.task import CareTask
from app.schemas.patient import (
    PatientCarePlanResponse, PlanMetrics, UpcomingAction,
    CareInstructionItem, WarningSignsInfo, SourceCitation
)
from app.agents.simplifier_agent import SimplifierAgent

router = APIRouter(prefix="/patients", tags=["Patients & Care Plan"])

@router.get(
    "/{id}",
    summary="Get patient summary metadata"
)
async def get_patient_metadata(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    if id.lower() in ["demo", "pat-001"]:
        query = select(DischargeRecord).order_by(DischargeRecord.created_at.desc())
    else:
        query = select(DischargeRecord).where(
            (DischargeRecord.patient_id == id) | (DischargeRecord.id == id)
        ).order_by(DischargeRecord.created_at.desc())
    res = await db.execute(query)
    record = res.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "id": id,
        "actualPatientId": record.patient_id,
        "name": record.patient_name or "Synthetic Patient",
        "dischargeDate": record.discharge_date or "2026-10-08",
        "documentName": record.filename or "discharge_summary.pdf",
        "status": record.status
    }

@router.get(
    "/{id}/plan",
    response_model=PatientCarePlanResponse,
    summary="Retrieve complete simplified care plan"
)
async def get_patient_plan(
    id: str,
    lang: str = Query("en", description="Language preference: en, hi, ta"),
    db: AsyncSession = Depends(get_db)
):
    # Lookup discharge record by patient_id or record_id, with demo fallback (most recent analyzed)
    if id.lower() in ["demo", "pat-001"]:
        query = select(DischargeRecord).order_by(DischargeRecord.created_at.desc())
    else:
        query = select(DischargeRecord).where(
            (DischargeRecord.patient_id == id) | (DischargeRecord.id == id)
        ).order_by(DischargeRecord.created_at.desc())
    res = await db.execute(query)
    record = res.scalars().first()

    if not record:
        raise HTTPException(status_code=404, detail="Patient care plan not found")

    actual_patient_id = record.patient_id

    # Retrieve tasks for metrics and upcoming action
    t_query = select(CareTask).where(CareTask.patient_id == actual_patient_id)
    t_res = await db.execute(t_query)
    tasks = t_res.scalars().all()

    total_actions = len(tasks)
    pending_count = sum(1 for t in tasks if t.status == "Pending")
    completed_count = sum(1 for t in tasks if t.status == "Completed")
    needs_review_count = sum(1 for t in tasks if t.status == "Needs Review")

    metrics = PlanMetrics(
        total_actions=total_actions,
        pending=pending_count,
        completed=completed_count,
        needs_review=needs_review_count
    )

    # Determine next upcoming action
    upcoming = None
    pending_tasks = sorted(
        [t for t in tasks if t.status == "Pending"],
        key=lambda t: t.due_date
    )
    if pending_tasks:
        next_t = pending_tasks[0]
        upcoming = UpcomingAction(
            task_id=next_t.id,
            title=next_t.title,
            due_date=next_t.due_date,
            category=next_t.category,
            status=next_t.status
        )

    # Prepare care instructions (with on-the-fly language simplification)
    raw_instructions = record.care_instructions or []
    care_items = []
    for item in raw_instructions:
        cat = item.get("category", "Care")
        orig = item.get("original_text", "")
        cit = item.get("source_citation", {"page": 1, "raw_quote": orig})
        simplified = SimplifierAgent.simplify_instruction(orig, cat, lang)
        
        care_items.append(CareInstructionItem(
            id=item.get("id", "inst-1"),
            category=cat,
            original_text=orig,
            simplified_text=simplified,
            confidence=item.get("confidence", 0.88),
            language=lang,
            source_citation=SourceCitation(
                page=cit.get("page", 1),
                raw_quote=cit.get("raw_quote", orig)
            )
        ))

    # Warning signs
    w_info = record.warning_signs or {}
    w_citation = w_info.get("source_citation", {"page": 1, "raw_quote": "Emergency Red Flags"})
    warning_signs = WarningSignsInfo(
        disclaimer=(
            "This information is reproduced directly from your discharge instructions. "
            "The AI does not diagnose symptoms or provide medical advice."
        ),
        confidence=w_info.get("confidence", 0.89),
        when_to_seek_immediate_care=w_info.get("when_to_seek_immediate_care", [
            "Fever above 101°F or persistent chills",
            "Severe shortness of breath or chest pain",
            "Sudden redness, warmth, or swelling"
        ]),
        source_citation=SourceCitation(
            page=w_citation.get("page", 1),
            raw_quote=w_citation.get("raw_quote", "Discharge instructions warning signs")
        )
    )

    return PatientCarePlanResponse(
        patient_id=actual_patient_id,
        patient_name=record.patient_name or "Synthetic Patient",
        discharge_date=record.discharge_date or "2026-10-08",
        metrics=metrics,
        next_upcoming_action=upcoming,
        care_instructions=care_items,
        warning_signs=warning_signs
    )

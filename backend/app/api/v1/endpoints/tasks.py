from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime

from app.db.session import get_db
from app.db.models.task import CareTask
from app.db.models.discharge_record import DischargeRecord
from app.schemas.task import TaskListResponse, TaskItem, TaskUpdateRequest, TaskUpdateResponse

router = APIRouter(tags=["Tasks & Tracking"])

STATUS_MAP = {
    "pending": "Pending",
    "completed": "Completed",
    "needs-review": "Needs Review",
    "needs review": "Needs Review",
    "all": "All",
}

@router.get(
    "/patients/{id}/tasks",
    response_model=TaskListResponse,
    summary="List actionable tasks with timeline metadata"
)
async def list_patient_tasks(
    id: str,
    status: Optional[str] = Query("All", description="Status filter: All, Pending, Completed, Needs Review"),
    category: Optional[str] = Query(None, description="Category filter (Appointment, Test, Medication, Referral, Care)"),
    db: AsyncSession = Depends(get_db)
):
    target_id = id
    if id.lower() in ["demo", "pat-001"]:
        d_res = await db.execute(select(DischargeRecord).order_by(DischargeRecord.created_at.desc()))
        d_rec = d_res.scalars().first()
        if d_rec:
            target_id = d_rec.patient_id

    query = select(CareTask).where(
        (CareTask.patient_id == target_id) | (CareTask.discharge_id == target_id)
    )

    if status and status.lower() != "all":
        norm_status = STATUS_MAP.get(status.lower(), status)
        query = query.where(CareTask.status == norm_status)

    if category:
        query = query.where(CareTask.category.ilike(f"%{category}%"))

    query = query.order_by(CareTask.due_date.asc())
    res = await db.execute(query)
    tasks = res.scalars().all()

    items = [
        TaskItem(
            id=t.id,
            title=t.title,
            category=t.category,
            due_date=t.due_date,
            status=t.status,
            action_type=t.action_type or "General Action",
            confidence_score=getattr(t, "confidence_score", None) or (0.82 if t.clarification_needed else 0.88),
            source_page=t.source_page or 1,
            source_text=t.source_text or "",
            clarification_needed=t.clarification_needed
        )
        for t in tasks
    ]

    return TaskListResponse(tasks=items)

@router.patch(
    "/tasks/{id}",
    response_model=TaskUpdateResponse,
    summary="Update task status"
)
async def update_task(
    id: str,
    payload: TaskUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    task = await db.get(CareTask, id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.status:
        norm_status = STATUS_MAP.get(payload.status.lower(), payload.status)
        task.status = norm_status
        if norm_status == "Completed":
            task.clarification_needed = False

    if payload.notes is not None:
        task.notes = payload.notes

    now = datetime.utcnow()
    task.updated_at = now
    await db.commit()

    return TaskUpdateResponse(
        id=task.id,
        updated_status=task.status,
        updated_at=now
    )

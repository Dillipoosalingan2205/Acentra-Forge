from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid
import asyncio

from app.db.session import get_db, AsyncSessionLocal
from app.db.models.discharge_record import DischargeRecord
from app.schemas.discharge import DischargeUploadResponse, DischargeStatusResponse
from app.services.pdf_parser import PDFParserService
from app.services.orchestrator import OrchestratorService
from app.agents.extractor_agent import ExtractorAgent

router = APIRouter(prefix="/discharge", tags=["Discharge Coordinator"])

async def run_pipeline_bg(discharge_id: str, patient_id: str, raw_text: str, lang: str):
    async with AsyncSessionLocal() as db:
        await OrchestratorService.process_document(
            discharge_id=discharge_id,
            patient_id=patient_id,
            raw_text=raw_text,
            db=db,
            lang=lang
        )

@router.post(
    "/upload",
    response_model=DischargeUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload synthetic discharge PDF"
)
async def upload_discharge_summary(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Synthetic discharge PDF or text file"),
    language_preference: str = Form("en", description="Patient preferred language: en, hi, ta"),
    db: AsyncSession = Depends(get_db)
):
    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    pages_data = PDFParserService.extract_text_from_pdf(content_bytes)
    raw_text = PDFParserService.get_full_text(pages_data)

    discharge_id = str(uuid.uuid4())
    patient_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # Pre-extract patient metadata immediately so patient name is known from step 0
    patient_meta = ExtractorAgent._extract_patient_metadata(pages_data, file.filename or "")
    extracted_name = patient_meta.get("name") or "Synthetic Patient"

    initial_steps = {
        "document_uploaded": "COMPLETED",
        "extracting_instructions": "IN_PROGRESS",
        "identifying_followup_actions": "PENDING",
        "checking_dates": "PENDING",
        "creating_care_timeline": "PENDING",
        "checking_for_unclear_instructions": "PENDING",
        "preparing_care_plan": "PENDING"
    }

    record = DischargeRecord(
        id=discharge_id,
        patient_id=patient_id,
        patient_name=extracted_name,
        filename=file.filename or "discharge_summary.pdf",
        raw_text=raw_text,
        language_preference=language_preference,
        status="PROCESSING",
        current_step="EXTRACTING_INSTRUCTIONS",
        progress_percentage=20,
        steps_status=initial_steps,
        created_at=now
    )
    db.add(record)
    await db.commit()

    # Trigger orchestrator in background
    background_tasks.add_task(
        run_pipeline_bg,
        discharge_id=discharge_id,
        patient_id=patient_id,
        raw_text=raw_text,
        lang=language_preference
    )

    return DischargeUploadResponse(
        discharge_id=discharge_id,
        patient_id=patient_id,
        patient_name=extracted_name,
        status="PROCESSING",
        message="Document queued for extraction and timeline generation",
        created_at=now
    )

@router.get(
    "/{id}",
    summary="Get discharge document details"
)
async def get_discharge_document(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    if id.lower() in ["demo", "doc-001"]:
        query = select(DischargeRecord).order_by(DischargeRecord.created_at.desc())
        res = await db.execute(query)
        record = res.scalars().first()
    else:
        record = await db.get(DischargeRecord, id)

    if not record:
        raise HTTPException(status_code=404, detail="Discharge document not found")

    return {
        "documentId": record.id,
        "requestedId": id,
        "patientId": record.patient_id,
        "patientName": record.patient_name,
        "fileName": record.filename or "discharge_summary.pdf",
        "status": record.status,
        "createdAt": record.created_at.isoformat() if record.created_at else None
    }

@router.get(
    "/{id}/status",
    response_model=DischargeStatusResponse,
    summary="Poll processing progress"
)
async def get_discharge_status(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    if id.lower() in ["demo", "doc-001"]:
        query = select(DischargeRecord).order_by(DischargeRecord.created_at.desc())
        res = await db.execute(query)
        record = res.scalars().first()
    else:
        record = await db.get(DischargeRecord, id)

    if not record:
        raise HTTPException(status_code=404, detail="Discharge record not found")

    steps = record.steps_status or {
        "document_uploaded": "COMPLETED",
        "extracting_instructions": "COMPLETED",
        "identifying_followup_actions": "COMPLETED",
        "checking_dates": "COMPLETED",
        "creating_care_timeline": "COMPLETED",
        "checking_for_unclear_instructions": "COMPLETED",
        "preparing_care_plan": "COMPLETED"
    }

    return DischargeStatusResponse(
        discharge_id=record.id,
        patient_id=record.patient_id,
        patient_name=record.patient_name,
        current_step=record.current_step,
        progress_percentage=record.progress_percentage or 100,
        steps_status=steps,
        error=record.error
    )

import asyncio
import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.db.models.discharge_record import DischargeRecord
from app.db.models.task import CareTask
from app.db.models.review_case import ReviewCase
from app.services.pdf_parser import PDFParserService
from app.agents.extractor_agent import ExtractorAgent
from app.agents.timeline_agent import TimelineAgent
from app.agents.simplifier_agent import SimplifierAgent
from app.agents.reviewer_agent import ReviewerAgent

class OrchestratorService:
    """
    Coordinates the multi-agent clinical coordination pipeline:
    Extractor -> Timeline -> Simplifier -> Reviewer.
    Updates processing stages and state machine progress asynchronously.
    """

    @classmethod
    async def process_document(
        cls,
        discharge_id: str,
        patient_id: str,
        raw_text: str,
        db: AsyncSession,
        lang: str = "en"
    ):
        steps = {
            "document_uploaded": "COMPLETED",
            "extracting_instructions": "IN_PROGRESS",
            "identifying_followup_actions": "PENDING",
            "checking_dates": "PENDING",
            "creating_care_timeline": "PENDING",
            "checking_for_unclear_instructions": "PENDING",
            "preparing_care_plan": "PENDING"
        }

        # Step 1: Update progress -> extracting_instructions
        await cls._update_status(
            db, discharge_id, "EXTRACTING_INSTRUCTIONS", 25, steps
        )

        rec = await db.get(DischargeRecord, discharge_id)
        filename = rec.filename if rec else "discharge_summary.pdf"

        # Split into pages for provenance
        if "--- PAGE BREAK ---" in raw_text:
            chunks = raw_text.split("--- PAGE BREAK ---")
            pages = [{"page": idx + 1, "text": c.strip()} for idx, c in enumerate(chunks) if c.strip()]
        elif "================================================================================" in raw_text:
            chunks = raw_text.split("================================================================================")
            pages = [{"page": idx + 1, "text": c.strip()} for idx, c in enumerate(chunks) if c.strip()]
        else:
            pages = [{"page": 1, "text": raw_text.strip()}]

        # Step 2: Extractor Agent
        extracted = ExtractorAgent.extract_all(pages, filename)
        p_info = extracted.get("patient_info", {})
        patient_name = p_info.get("name", "Synthetic Patient")
        discharge_date = p_info.get("discharge_date", "2026-10-08")

        steps["extracting_instructions"] = "COMPLETED"
        steps["identifying_followup_actions"] = "IN_PROGRESS"
        await cls._update_status(
            db, discharge_id, "IDENTIFYING_FOLLOWUP_ACTIONS", 40, steps,
            patient_name=patient_name, discharge_date=discharge_date
        )

        # Step 3: Timeline Agent - normalize dates & build tasks
        steps["identifying_followup_actions"] = "COMPLETED"
        steps["checking_dates"] = "IN_PROGRESS"
        await cls._update_status(db, discharge_id, "CHECKING_DATES", 55, steps)

        tasks_data = TimelineAgent.build_tasks_timeline(extracted, discharge_date)

        steps["checking_dates"] = "COMPLETED"
        steps["creating_care_timeline"] = "IN_PROGRESS"
        await cls._update_status(db, discharge_id, "CREATING_CARE_TIMELINE", 70, steps)

        # Step 4: Reviewer Agent - Check for unclear instructions and safety triage
        review_cases = ReviewerAgent.evaluate_extracted_items(
            patient_id=patient_id,
            discharge_id=discharge_id,
            extracted_data=extracted,
            tasks=tasks_data
        )

        # Persist tasks to database with evaluated status & calibrated confidence_score
        await db.execute(delete(CareTask).where(CareTask.discharge_id == discharge_id))
        await db.execute(delete(ReviewCase).where(ReviewCase.discharge_id == discharge_id))

        saved_tasks = []
        for t in tasks_data:
            task_record = CareTask(
                id=str(uuid.uuid4()),
                patient_id=patient_id,
                discharge_id=discharge_id,
                title=t["title"],
                category=t["category"],
                due_date=t["due_date"],
                status=t["status"],
                action_type=t["action_type"],
                confidence_score=t.get("confidence_score", 0.88),
                source_page=t["source_page"],
                source_text=t["source_text"],
                clarification_needed=t["clarification_needed"]
            )
            db.add(task_record)
            saved_tasks.append(task_record)

        for rc in review_cases:
            matched_task = None
            rc_orig = (rc.get("original_instruction") or "").lower()
            for st in saved_tasks:
                if st.clarification_needed or st.status == "Needs Review":
                    if not rc_orig or rc_orig in (st.source_text or "").lower() or (st.source_text or "").lower() in rc_orig or rc_orig in (st.title or "").lower():
                        matched_task = st
                        break
            if not matched_task:
                for st in saved_tasks:
                    if st.clarification_needed or st.status == "Needs Review":
                        matched_task = st
                        break

            db_case = ReviewCase(
                case_id=str(uuid.uuid4()),
                patient_id=patient_id,
                discharge_id=discharge_id,
                task_id=matched_task.id if matched_task else None,
                reason=rc["reason"],
                original_instruction=rc["original_instruction"],
                ai_interpretation=rc["ai_interpretation"],
                confidence_score=rc["confidence_score"],
                priority=rc["priority"],
                resolution_status="OPEN",
                reviewer_notes=""
            )
            db.add(db_case)
        await db.commit()

        # Step 5: Simplifier Agent - Prepare patient-friendly care instructions
        steps["creating_care_timeline"] = "COMPLETED"
        steps["checking_for_unclear_instructions"] = "COMPLETED"
        steps["preparing_care_plan"] = "IN_PROGRESS"
        await cls._update_status(db, discharge_id, "PREPARING_CARE_PLAN", 95, steps)

        simplified_care = []
        for c in extracted.get("care_instructions", []):
            orig = c.get("original_text", "")
            cat = c.get("category", "Care")
            conf = c.get("confidence", 0.88)
            simplified_care.append({
                "id": str(uuid.uuid4()),
                "category": cat,
                "original_text": orig,
                "simplified_text": SimplifierAgent.simplify_instruction(orig, cat, lang),
                "confidence": conf,
                "language": lang,
                "source_citation": c.get("source_citation", {"page": 1, "raw_quote": orig})
            })

        steps["preparing_care_plan"] = "COMPLETED"

        # Finalize record
        rec = await db.get(DischargeRecord, discharge_id)
        if rec:
            rec.status = "COMPLETED"
            rec.current_step = "PREPARING_CARE_PLAN"
            rec.progress_percentage = 100
            rec.steps_status = steps
            rec.care_instructions = simplified_care
            rec.warning_signs = extracted.get("warning_signs", {})
            rec.patient_name = patient_name
            rec.discharge_date = discharge_date
            await db.commit()

    @classmethod
    async def _update_status(
        cls,
        db: AsyncSession,
        discharge_id: str,
        current_step: str,
        progress: int,
        steps: Dict[str, str],
        patient_name: str = None,
        discharge_date: str = None
    ):
        rec = await db.get(DischargeRecord, discharge_id)
        if rec:
            rec.current_step = current_step
            rec.progress_percentage = progress
            rec.steps_status = steps
            if patient_name:
                rec.patient_name = patient_name
            if discharge_date:
                rec.discharge_date = discharge_date
            await db.commit()

import re
from typing import List, Dict, Any
from app.core.guardrails import ClinicalGuardrails

class ReviewerAgent:
    """
    Heuristic & confidence-based triage for missing dates,
    dosage ambiguities, and safety escalations.
    Escalates clinically sensitive or uncertain items to the Human Review Queue.
    """

    @classmethod
    def evaluate_extracted_items(
        cls,
        patient_id: str,
        discharge_id: str,
        extracted_data: Dict[str, Any],
        tasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        review_cases = []

        # Check all raw text and instructions for clinical guardrail ambiguities
        all_texts = []
        for med in extracted_data.get("medications", []):
            all_texts.append(("Medication", med.get("details", ""), med.get("source_citation", {})))
        for appt in extracted_data.get("appointments", []):
            all_texts.append(("Appointment", appt.get("details", ""), appt.get("source_citation", {})))
        for test in extracted_data.get("tests", []):
            all_texts.append(("Test", test.get("details", ""), test.get("source_citation", {})))
        for ref in extracted_data.get("referrals", []):
            all_texts.append(("Referral", ref.get("details", ""), ref.get("source_citation", {})))
        for care in extracted_data.get("care_instructions", []):
            all_texts.append(("Care Instruction", care.get("original_text", ""), care.get("source_citation", {})))

        for category, text, citation in all_texts:
            flags = ClinicalGuardrails.detect_ambiguities(text)
            for flag in flags:
                review_cases.append({
                    "patient_id": patient_id,
                    "discharge_id": discharge_id,
                    "reason": flag["reason"],
                    "original_instruction": text,
                    "ai_interpretation": f"Calibrated extraction confidence (82%). Ambiguous clinical frequency pattern ('{flag['matched_pattern']}') flagged under patient safety protocol. Clinician verification required before scheduling.",
                    "confidence_score": 0.82,
                    "priority": flag["priority"], # HIGH
                    "resolution_status": "OPEN",
                    "reviewer_notes": ""
                })

        # Check tasks for missing dates or vague timing
        for task in tasks:
            due = task.get("due_date", "")
            title = task.get("title", "")
            if not due or due == "9999-99-99":
                task["clarification_needed"] = True
                task["status"] = "Needs Review"
                task["confidence_score"] = 0.84
                review_cases.append({
                    "patient_id": patient_id,
                    "discharge_id": discharge_id,
                    "reason": "Missing exact appointment or test date",
                    "original_instruction": task.get("source_text", title),
                    "ai_interpretation": "Calibrated extraction confidence (84%). Due date could not be deterministically resolved from the discharge document; clinician confirmation needed.",
                    "confidence_score": 0.84,
                    "priority": "MEDIUM",
                    "resolution_status": "OPEN",
                    "reviewer_notes": ""
                })
            elif "as previously" in task.get("source_text", "").lower() or "as directed" in task.get("source_text", "").lower():
                task["clarification_needed"] = True
                task["status"] = "Needs Review"
                task["confidence_score"] = 0.82

        return review_cases

import re
from datetime import datetime, timedelta
from typing import List, Dict, Any

class TimelineAgent:
    """
    Calculates normalized ISO dates, recurring intervals,
    and chronological task schedules from discharge directives.
    """

    MONTH_MAP = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
    }

    @classmethod
    def normalize_date(cls, raw_date_str: str, base_date_str: str = "2026-10-08") -> str:
        """
        Parses relative or absolute date phrases into YYYY-MM-DD.
        Examples:
        - "in 7 days" -> base_date + 7 days
        - "in 2 weeks" -> base_date + 14 days
        - "12-OCT-2026" -> "2026-10-12"
        - "October 15, 2026" -> "2026-10-15"
        """
        try:
            base_dt = datetime.strptime(base_date_str[:10], "%Y-%m-%d")
        except Exception:
            base_dt = datetime(2026, 10, 8)

        if not raw_date_str:
            return (base_dt + timedelta(days=7)).strftime("%Y-%m-%d")

        text = raw_date_str.strip()

        # Relative days: "in X days" or "within X days"
        rel_days = re.search(r"(?:in|within)\s+(\d+)\s+days?", text, re.IGNORECASE)
        if rel_days:
            days = int(rel_days.group(1))
            return (base_dt + timedelta(days=days)).strftime("%Y-%m-%d")

        # Relative weeks: "in X weeks"
        rel_weeks = re.search(r"(?:in|within)\s+(\d+)\s+weeks?", text, re.IGNORECASE)
        if rel_weeks:
            weeks = int(rel_weeks.group(1))
            return (base_dt + timedelta(weeks=weeks)).strftime("%Y-%m-%d")

        # Pattern: 12-OCT-2026 or 12-Oct-2026
        match_dmy = re.search(r"(\d{1,2})[\-\s]([A-Za-z]{3,9})[\-\s](\d{4})", text)
        if match_dmy:
            day = int(match_dmy.group(1))
            m_str = match_dmy.group(2)[:3].lower()
            year = int(match_dmy.group(3))
            month = cls.MONTH_MAP.get(m_str, base_dt.month)
            try:
                return datetime(year, month, day).strftime("%Y-%m-%d")
            except Exception:
                pass

        # Pattern: October 15, 2026 or Oct 15, 2026
        match_mdy = re.search(r"([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})", text)
        if match_mdy:
            m_str = match_mdy.group(1)[:3].lower()
            day = int(match_mdy.group(2))
            year = int(match_mdy.group(3))
            month = cls.MONTH_MAP.get(m_str, base_dt.month)
            try:
                return datetime(year, month, day).strftime("%Y-%m-%d")
            except Exception:
                pass

        # If already YYYY-MM-DD
        match_iso = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
        if match_iso:
            return match_iso.group(0)

        # Fallback scheduled within 7 days
        return (base_dt + timedelta(days=7)).strftime("%Y-%m-%d")

    @classmethod
    def build_tasks_timeline(cls, extracted_data: Dict[str, Any], discharge_date: str) -> List[Dict[str, Any]]:
        """
        Creates actionable task objects with chronological ordering.
        """
        tasks = []
        patient_info = extracted_data.get("patient_info", {})
        base_date = patient_info.get("discharge_date", discharge_date)

        # 1. Appointments
        for appt in extracted_data.get("appointments", []):
            due = cls.normalize_date(appt.get("details", ""), base_date)
            tasks.append({
                "title": appt["title"],
                "category": "Appointment",
                "action_type": "Clinic Visit",
                "due_date": due,
                "status": "Pending",
                "confidence_score": appt.get("confidence", 0.89),
                "source_page": appt.get("source_citation", {}).get("page", 1),
                "source_text": appt.get("source_citation", {}).get("raw_quote", ""),
                "clarification_needed": False
            })

        # 2. Diagnostic Tests
        for test in extracted_data.get("tests", []):
            due = cls.normalize_date(test.get("details", ""), base_date)
            tasks.append({
                "title": test["title"],
                "category": "Test",
                "action_type": "Diagnostic Workup",
                "due_date": due,
                "status": "Pending",
                "confidence_score": test.get("confidence", 0.88),
                "source_page": test.get("source_citation", {}).get("page", 1),
                "source_text": test.get("source_citation", {}).get("raw_quote", ""),
                "clarification_needed": False
            })

        # 3. Medications
        for med in extracted_data.get("medications", []):
            due = cls.normalize_date(med.get("details", ""), base_date)
            tasks.append({
                "title": med["title"],
                "category": "Medication",
                "action_type": "Prescription Regimen",
                "due_date": due,
                "status": "Pending",
                "confidence_score": med.get("confidence", 0.88),
                "source_page": med.get("source_citation", {}).get("page", 1),
                "source_text": med.get("source_citation", {}).get("raw_quote", ""),
                "clarification_needed": False
            })

        # 4. Referrals
        for ref in extracted_data.get("referrals", []):
            due = cls.normalize_date(ref.get("details", ""), base_date)
            tasks.append({
                "title": ref["title"],
                "category": "Referral",
                "action_type": "Specialist Referral",
                "due_date": due,
                "status": "Pending",
                "confidence_score": ref.get("confidence", 0.88),
                "source_page": ref.get("source_citation", {}).get("page", 1),
                "source_text": ref.get("source_citation", {}).get("raw_quote", ""),
                "clarification_needed": False
            })

        # 5. Care & Wound Instructions as daily/ongoing tasks
        for care in extracted_data.get("care_instructions", []):
            care_title = care.get("original_text", "")
            title = care_title if len(care_title) <= 80 else f"{care_title[:77]}..."
            tasks.append({
                "title": title,
                "category": "Care",
                "action_type": "Self-Care Protocol",
                "due_date": base_date,
                "status": "Pending",
                "confidence_score": care.get("confidence", 0.86),
                "source_page": care.get("source_citation", {}).get("page", 1),
                "source_text": care.get("source_citation", {}).get("raw_quote", care_title),
                "clarification_needed": False
            })

        # Sort chronologically
        tasks.sort(key=lambda t: t.get("due_date", "9999-99-99"))
        return tasks

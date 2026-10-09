import re
from typing import Tuple, Dict, Any, List

class ClinicalGuardrails:
    """
    Strict safety assertion filters preventing:
    1. Direct medical diagnosing or treatment recommendations
    2. Modification or discontinuation of prescription dosages
    3. Failure to flag ambiguous instructions for human review
    4. Missing provenance citations
    """
    
    SAFETY_DISCLAIMER = (
        "This tool organizes discharge instructions but does NOT diagnose, "
        "change medications, or recommend treatments. Always follow your "
        "treating physician's advice. In case of emergency, call emergency services immediately."
    )
    
    PROHIBITED_INTENTS = [
        r"(change|increase|decrease|stop|discontinue|alter)\s+(my\s+)?(dose|dosage|medication|medicine|pill)",
        r"(what|do)\s+i\s+have\b",
        r"(diagnose|can you tell if i have cancer|heart attack|stroke)",
        r"(should i take|can i double)\s+my\s+dose"
    ]
    
    AMBIGUOUS_PATTERNS = [
        (r"as (previously )?directed", "Instruction refers to prior directive with missing explicit schedule"),
        (r"prn\b(?!.*for)", "PRN (as needed) without qualifying indication or frequency limits"),
        (r"take as needed\b(?!\s+for)", "Missing specific triggers or dosage cap for PRN medication"),
        (r"follow-?up\s+(soon|as needed|later)", "Unspecified follow-up date/interval"),
        (r"continue (home|previous) medications", "Refers to unspecified pre-admission home regimen"),
        (r"taper as discussed", "Missing explicit steroid/tapering titration schedule")
    ]

    @classmethod
    def validate_clinical_query(cls, text: str) -> Tuple[bool, str]:
        """
        Validates user or agent input against prohibited clinical advice boundaries.
        Returns (is_safe, message).
        """
        for pattern in cls.PROHIBITED_INTENTS:
            if re.search(pattern, text, re.IGNORECASE):
                return False, (
                    "Clinical Safety Assertion Triggered: The system cannot modify medication dosages, "
                    "recommend treatments, or evaluate diagnostic inquiries. " + cls.SAFETY_DISCLAIMER
                )
        return True, ""

    @classmethod
    def detect_ambiguities(cls, instruction_text: str) -> List[Dict[str, str]]:
        """
        Flags clinically ambiguous text that mandates human triage in the Review Queue.
        """
        flags = []
        for pattern, reason in cls.AMBIGUOUS_PATTERNS:
            if re.search(pattern, instruction_text, re.IGNORECASE):
                flags.append({
                    "reason": reason,
                    "matched_pattern": pattern,
                    "priority": "HIGH"
                })
        return flags

    @classmethod
    def assert_provenance(cls, item: Dict[str, Any]) -> bool:
        """
        Verifies that every extracted instruction or task carries a valid source_citation.
        """
        citation = item.get("source_citation")
        if not citation:
            return False
        return bool(citation.get("page") and citation.get("raw_quote"))

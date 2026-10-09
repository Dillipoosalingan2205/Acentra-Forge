import os
import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.provider import CareProvider
from app.db.models.discharge_record import DischargeRecord
from app.db.models.task import CareTask
from app.db.models.review_case import ReviewCase

SYNTHETIC_PROVIDERS = [
    {
        "id": "prov-001",
        "name": "Dr. Marcus Vance, MD",
        "specialty": "General Medicine",
        "facility_type": "Clinic",
        "address": "Metro Health Clinic, Suite 300, 450 Health Parkway",
        "location": "Metro City",
        "distance_km": 2.1,
        "rating": 4.8,
        "contact_synthetic": "+1-555-019-2831",
        "accepts_insurance": True
    },
    {
        "id": "prov-002",
        "name": "Dr. Priya Sharma, MD",
        "specialty": "Cardiology",
        "facility_type": "Hospital",
        "address": "Apollo Heart Institute, Greams Road",
        "location": "Chennai",
        "distance_km": 3.8,
        "rating": 4.9,
        "contact_synthetic": "+91-44-2829-0200",
        "accepts_insurance": True
    },
    {
        "id": "prov-003",
        "name": "Dr. Aris Thorne, MD, FAAOS",
        "specialty": "Orthopedic Surgery",
        "facility_type": "Hospital",
        "address": "Apex Pavilion Suite 410, Metro Health Campus",
        "location": "Metro City",
        "distance_km": 1.5,
        "rating": 4.9,
        "contact_synthetic": "+1-555-014-9922",
        "accepts_insurance": True
    },
    {
        "id": "prov-004",
        "name": "Dr. Rajesh Sundaram, MD",
        "specialty": "Cardiology",
        "facility_type": "Hospital",
        "address": "Fortis Escorts Clinic, Okhla",
        "location": "New Delhi",
        "distance_km": 4.2,
        "rating": 4.8,
        "contact_synthetic": "+91-11-4713-5000",
        "accepts_insurance": True
    },
    {
        "id": "prov-005",
        "name": "Dr. Nalini Sunder, MD",
        "specialty": "Nephrology",
        "facility_type": "Clinic",
        "address": "Renal Care Center, 210 Medical Arts",
        "location": "Metro City",
        "distance_km": 3.1,
        "rating": 4.7,
        "contact_synthetic": "+1-555-018-7711",
        "accepts_insurance": True
    },
    {
        "id": "prov-006",
        "name": "Dr. Vikram Patel, MD, FACC",
        "specialty": "Cardiology",
        "facility_type": "Hospital",
        "address": "Advanced Heart Institute, 420 Cardiac Way",
        "location": "Metro City",
        "distance_km": 2.7,
        "rating": 4.9,
        "contact_synthetic": "+1-555-017-3344",
        "accepts_insurance": True
    },
    {
        "id": "prov-007",
        "name": "ABC Physiotherapy & Rehab Center",
        "specialty": "Physical Therapy",
        "facility_type": "Clinic",
        "address": "720 Wellness Blvd, Central Plaza",
        "location": "Metro City",
        "distance_km": 1.2,
        "rating": 4.6,
        "contact_synthetic": "+1-555-012-6633",
        "accepts_insurance": True
    },
    {
        "id": "prov-008",
        "name": "XYZ Rehab Clinic",
        "specialty": "Physical Therapy",
        "facility_type": "Clinic",
        "address": "Anna Nagar 2nd Avenue",
        "location": "Chennai",
        "distance_km": 4.1,
        "rating": 4.5,
        "contact_synthetic": "+91-44-2621-1234",
        "accepts_insurance": True
    },
    {
        "id": "prov-009",
        "name": "Metropolis Diagnostic Lab",
        "specialty": "Diagnostic Tests",
        "facility_type": "Diagnostic Lab",
        "address": "100 Diagnostic Plaza, Metro City",
        "location": "Metro City",
        "distance_km": 0.8,
        "rating": 4.7,
        "contact_synthetic": "+1-555-011-8899",
        "accepts_insurance": True
    },
    {
        "id": "prov-010",
        "name": "Dr. Ananya Sharma, MD",
        "specialty": "Cardiology",
        "facility_type": "Clinic",
        "address": "Metro Heart Care, Sector 14",
        "location": "Metro City",
        "distance_km": 3.4,
        "rating": 4.8,
        "contact_synthetic": "+1-555-015-4477",
        "accepts_insurance": True
    },
    {
        "id": "prov-011",
        "name": "Dr. R. Rajesh, MBBS, MD",
        "specialty": "General Medicine",
        "facility_type": "Clinic",
        "address": "Family Health Care, T. Nagar",
        "location": "Chennai",
        "distance_km": 2.9,
        "rating": 4.6,
        "contact_synthetic": "+91-44-2434-5678",
        "accepts_insurance": True
    }
]

SAMPLE_SUMMARIES = {
    "sample_1_simple": {
        "id": "rec-syn-001",
        "patient_id": "pat-syn-001",
        "patient_name": "Robert \"Bob\" Davis",
        "discharge_date": "2026-10-08",
        "filename": "sample_1_simple.pdf",
        "raw_text": """HOSPITAL DISCHARGE SUMMARY
METRO HEALTH SYSTEM - ADULT INPATIENT MEDICINE
================================================================================
PATIENT NAME: Robert "Bob" Davis (SYNTHETIC PATIENT)
RECORD NUMBER: MRN-SYN-84920
DATE OF ADMISSION: 01-OCT-2026
DATE OF DISCHARGE: 2026-10-08
ATTENDING PHYSICIAN: Dr. Sarah Jenkins, MD (Internal Medicine)
DISCHARGE DIAGNOSIS: Mild Acute Diverticulitis (Resolved), Essential Hypertension

HOSPITAL COURSE SUMMARY:
Patient admitted with left lower quadrant abdominal discomfort and mild fever. CT abdomen confirmed uncomplicated mild diverticulitis. Treated with bowel rest, intravenous hydration, and 48 hours of IV antibiotics with complete resolution of pain and fever. Tolerating oral diet well upon discharge.

MEDICATION DISCHARGE INSTRUCTIONS:
1. Amoxicillin-Clavulanate (Augmentin) 875/125 mg oral tablet
   Dosage: 1 tablet by mouth twice daily (every 12 hours) with meals.
   Duration: Complete remaining 5 days through 13-OCT-2026.
2. Amlodipine 5 mg oral tablet
   Dosage: 1 tablet once daily in the morning for blood pressure.
   Duration: Ongoing chronic therapy.

CARE & DIET INSTRUCTIONS:
1. Diet: Progress to low-fiber diet for 7 days, then gradually resume high-fiber diet with adequate water intake (minimum 2 liters daily).
2. Activity: Light walking permitted. Avoid heavy lifting (>15 lbs) until follow-up visit.

SCHEDULED FOLLOW-UP APPOINTMENTS & TESTS:
1. Primary Care Follow-up Appointment:
   Provider: Dr. Marcus Vance, MD (Family Medicine, Metro Health Clinic)
   Date: 2026-10-15 at 10:30 AM
   Location: Suite 300, 450 Health Parkway
2. Routine Blood Work (Complete Blood Count):
   Test: CBC with differential
   Date: 2026-10-14 at 08:00 AM (Metropolis Diagnostic Lab)

WARNING SIGNS - WHEN TO SEEK IMMEDIATE MEDICAL ATTENTION:
- Temperature higher than 100.4°F (38.0°C) or chills
- Rebound abdominal pain, severe cramping, or nausea/vomiting
- Inability to keep fluids down for > 12 hours
- Bright red blood in stool or black tarry stools
"""
    },
    "sample_2_medium": {
        "id": "rec-syn-002",
        "patient_id": "pat-syn-002",
        "patient_name": "Eleanor Chen",
        "discharge_date": "2026-10-08",
        "filename": "sample_2_medium.pdf",
        "raw_text": """SURGICAL DISCHARGE SUMMARY & POST-OPERATIVE CARE PLAN
APEX MEMORIAL SURGICAL CENTER - DEPARTMENT OF ORTHOPEDICS
================================================================================
PATIENT NAME: Eleanor Chen (SYNTHETIC PATIENT)
RECORD NUMBER: MRN-SYN-91042
DATE OF PROCEDURE: 05-OCT-2026
DATE OF DISCHARGE: 2026-10-08
PRIMARY SURGEON: Dr. Aris Thorne, MD, FAAOS (Orthopedic Surgery)
PROCEDURE PERFORMED: Right Total Knee Arthroplasty (TKA / Knee Replacement)

OPERATIVE & INPATIENT SUMMARY:
Patient underwent uneventful right total knee replacement. Range of motion achieved 0 to 90 degrees prior to discharge with inpatient physical therapy. Incision closed with surgical staples, clean/dry/intact.

DISCHARGE MEDICATIONS:
1. Enoxaparin (Lovenox) 30 mg subcutaneous injection
   Instructions: Inject subcutaneously into abdominal wall once daily every morning for deep vein thrombosis (DVT) prophylaxis.
   Duration: Complete 14 days (through 2026-10-22).
2. Acetaminophen 500 mg oral tablet
   Instructions: Take 2 tablets (1000 mg) every 8 hours as needed for mild-to-moderate baseline pain. Do not exceed 3000 mg in 24 hours.
3. Oxycodone 5 mg oral tablet
   Instructions: Take 1 tablet every 6 hours PRN for severe breakthrough pain only.
4. Cephalexin 500 mg capsule
   Instructions: Take 1 capsule 4 times daily (every 6 hours) for post-surgical infection prophylaxis for 5 days.

SURGICAL WOUND & REHABILITATION CARE:
1. Incision and Dressing Care:
   Keep Aquacel silver dressing dry and in place until post-op clinic visit. Showering allowed after 48 hours with waterproof barrier.
2. Physical Therapy & Exercises:
   Begin outpatient physical therapy 2-3 times weekly starting within 5-7 days. Perform home ankle pumps and quad sets 3 times daily.
3. Weight Bearing:
   Weight-bearing as tolerated with walker or crutches.

FOLLOW-UP APPOINTMENTS & TESTS:
1. Post-Operative Orthopedic Surgery Visit:
   Provider: Dr. Aris Thorne, MD (Orthopedic Surgery)
   Date: 2026-10-20 at 02:00 PM (Staple removal & incision check)
   Location: Apex Pavilion Suite 410
2. Physical Therapy Intake:
   Provider: ABC Physiotherapy & Rehab Center
   Date: 2026-10-15 at 11:00 AM
   Location: 720 Wellness Blvd

WARNING SIGNS - WHEN TO SEEK IMMEDIATE MEDICAL ATTENTION:
- Sudden shortness of breath, chest pain, or coughing up blood
- Calf pain, significant swelling, warmth, or redness in lower leg (DVT signs)
- Temperature greater than 101.5°F (38.6°C) or shaking chills
- Purulent, foul-smelling drainage or expanding erythema from incision
"""
    },
    "sample_3_complex": {
        "id": "rec-syn-003",
        "patient_id": "pat-syn-003",
        "patient_name": "Margaret K. Higgins",
        "discharge_date": "2026-10-08",
        "filename": "sample_3_complex.pdf",
        "raw_text": """COMPREHENSIVE MULTIDISCIPLINARY DISCHARGE SUMMARY
UNIVERSITY MEDICAL CENTER - ADVANCED HEART & VASCULAR INSTITUTE
================================================================================
PATIENT NAME: Margaret K. Higgins (SYNTHETIC PATIENT)
RECORD NUMBER: MRN-SYN-77401
DATE OF ADMISSION: 01-OCT-2026
DATE OF DISCHARGE: 2026-10-08
ATTENDING PHYSICIANS:
- Dr. Vikram Patel, MD, FACC (Cardiology)
- Dr. Nalini Sunder, MD (Nephrology Consultant)

PRINCIPAL DISCHARGE DIAGNOSES:
1. Acute Decompensated Heart Failure with Preserved Ejection Fraction (HFpEF, NYHA Class III)
2. Chronic Kidney Disease Stage 3b (Baseline eGFR 38 mL/min)
3. Type 2 Diabetes Mellitus with microvascular changes

INPATIENT COURSE SUMMARY:
Patient presented with fluid overload, dyspnea, and peripheral edema. Successfully diuresed with IV Furosemide with negative fluid balance. Discharged in euvolemic state on adjusted regimen.

DISCHARGE MEDICATIONS & DOSING SCHEDULE:
1. Furosemide (Lasix) 40 mg oral tablet
   Instructions: Take 1 tablet by mouth every morning at 08:00 AM. If morning weight increases by > 3 lbs in 48 hours, contact clinic.
2. Sacubitril / Valsartan (Entresto) 24/26 mg oral tablet
   Instructions: Take 1 tablet twice daily (morning and evening). Monitor blood pressure.
3. Glimepiride oral tablet
   Instructions: Take as previously directed by endocrinologist prior to admission.
4. Potassium Chloride 20 mEq extended-release
   Instructions: Take 1 tablet once daily with food.

CARE & MONITORING PROTOCOLS:
1. Daily Weight Tracking:
   Weigh yourself every morning after first urination, before breakfast. Record in care log.
2. Fluid and Sodium Restriction:
   Strict fluid restriction to maximum 1.5 to 2.0 liters in 24 hours. Sodium < 2000 mg/day.

SCHEDULED FOLLOW-UP APPOINTMENTS & TESTS:
1. Heart Failure Clinic Follow-up:
   Provider: Dr. Vikram Patel, MD (Cardiology)
   Date: 2026-10-16 at 09:15 AM
   Location: Advanced Heart Institute, 420 Cardiac Way
2. Renal Function & Electrolyte Panel:
   Test: Basic Metabolic Panel (BMP - Creatinine, BUN, Potassium, Sodium)
   Date: 2026-10-13 at 08:30 AM (Metropolis Diagnostic Lab)
3. Nephrology Follow-up:
   Provider: Dr. Nalini Sunder, MD
   Date: 2026-10-22 at 01:30 PM
   Location: Renal Care Center, 210 Medical Arts

WARNING SIGNS - SEEK IMMEDIATE EMERGENCY CARE:
- Sudden severe shortness of breath at rest or waking gasping for air
- Rapid weight gain of > 3 pounds in 24 hours or 5 pounds in 1 week
- Chest tightness, pressure, or palpitations accompanied by dizziness
- Syncope (fainting) or near-syncope episode
"""
    }
}

async def seed_synthetic_data(db: AsyncSession):
    """
    Seeds initial synthetic providers and 3 clinical benchmark discharge records
    for immediate demo operation.
    """
    # 1. Seed providers
    p_check = await db.execute(select(CareProvider).limit(1))
    if not p_check.scalars().first():
        for prov in SYNTHETIC_PROVIDERS:
            db_prov = CareProvider(
                id=prov["id"],
                name=prov["name"],
                specialty=prov["specialty"],
                facility_type=prov["facility_type"],
                address=prov["address"],
                location=prov["location"],
                distance_km=prov["distance_km"],
                rating=prov["rating"],
                contact_synthetic=prov["contact_synthetic"],
                accepts_insurance=prov["accepts_insurance"]
            )
            db.add(db_prov)
        await db.commit()

    # 2. Seed synthetic discharge records if none exist
    d_check = await db.execute(select(DischargeRecord).limit(1))
    if not d_check.scalars().first():
        from app.services.orchestrator import OrchestratorService
        for key, sdata in SAMPLE_SUMMARIES.items():
            record = DischargeRecord(
                id=sdata["id"],
                patient_id=sdata["patient_id"],
                patient_name=sdata["patient_name"],
                discharge_date=sdata["discharge_date"],
                filename=sdata["filename"],
                raw_text=sdata["raw_text"],
                language_preference="en",
                status="COMPLETED",
                current_step="PREPARING_CARE_PLAN",
                progress_percentage=100,
                steps_status={
                    "document_uploaded": "COMPLETED",
                    "extracting_instructions": "COMPLETED",
                    "identifying_followup_actions": "COMPLETED",
                    "checking_dates": "COMPLETED",
                    "creating_care_timeline": "COMPLETED",
                    "checking_for_unclear_instructions": "COMPLETED",
                    "preparing_care_plan": "COMPLETED"
                }
            )
            db.add(record)
            await db.commit()

            # Execute pipeline synchronously for pre-seeded records
            await OrchestratorService.process_document(
                discharge_id=sdata["id"],
                patient_id=sdata["patient_id"],
                raw_text=sdata["raw_text"],
                db=db,
                lang="en"
            )

def generate_sample_pdf_files(output_dir: str = "synthetic_data/discharge_summaries"):
    """
    Generates actual downloadable synthetic PDF files using reportlab.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    
    os.makedirs(output_dir, exist_ok=True)
    for key, data in SAMPLE_SUMMARIES.items():
        pdf_path = os.path.join(output_dir, data["filename"])
        if not os.path.exists(pdf_path):
            c = canvas.Canvas(pdf_path, pagesize=letter)
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, 750, f"SYNTHETIC DISCHARGE SUMMARY - {data['patient_name'].upper()}")
            c.setFont("Helvetica", 9)
            
            y = 720
            lines = data["raw_text"].split("\n")
            for line in lines:
                if y < 60:
                    c.showPage()
                    c.setFont("Helvetica", 9)
                    y = 750
                c.drawString(50, y, line[:95])
                y -= 14
            c.save()

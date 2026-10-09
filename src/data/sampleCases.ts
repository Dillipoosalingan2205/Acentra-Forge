import { SampleCase } from '../types/aegis';

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'cholecystectomy-rahul',
    title: 'Laparoscopic Cholecystectomy (Gallbladder)',
    patient: 'Rahul Sharma (M/44)',
    diagnosis: 'Laparoscopic Cholecystectomy, uncomplicated post-op Day 2',
    badge: 'Standard Post-Op',
    hasEscalation: false,
    summary: 'Antibiotics, pain management, ultrasound in 10 days, surgical OPD follow-up in 2 weeks, low-fat diet referral.',
    content: `PATIENT: Rahul Sharma | DOB: 1982-05-14 | MRN: AG-90214 | DISCHARGE DATE: 2026-10-08
ADMITTING DIAGNOSIS: Symptomatic Cholelithiasis
PROCEDURE: Laparoscopic Cholecystectomy, uncomplicated.
VITALS AT DISCHARGE: BP: 122/78 mmHg | HR: 74 bpm | SpO2: 98% on room air | Temp: 98.4°F
ALLERGIES: No Known Drug Allergies (NKDA)

MEDICATIONS:
- Amoxicillin / Clavulanate (Augmentin) 625mg PO BID (twice daily after meals) x 5 days.
- Paracetamol 650mg PO PRN (as needed for incision discomfort, maximum 4 tablets in 24 hours).
- Pantoprazole 40mg PO QD (once daily, 30 minutes before breakfast) x 14 days.

FOLLOW-UP APPOINTMENTS & DIAGNOSTICS:
- Ultrasound Abdomen & Liver Function Test (LFT) in 10 days at local accredited diagnostic imaging center.
- Follow up with Dr. V. K. Gupta in Surgical OPD in 2 weeks (Day 14) for surgical site evaluation.
- Referral to Clinical Nutritionist for low-fat gallbladder recovery diet plan within 7 days.

CARE INSTRUCTIONS:
- Keep surgical port dressing clean and dry. Sterile dressing change recommended on Day 3.
- Showering permitted after 48 hours; pat dry gently. Do not soak in tub.
- Physical restriction: Strictly no heavy lifting (>5 kg) and avoid vigorous core exertion for 4 weeks.

WARNING SIGNS & EMERGENCY ALERTS:
- Severe abdominal pain not relieved by medication, high fever (>101°F / 38.3°C), persistent nausea/vomiting, or yellowing of the eyes/skin (jaundice) requires immediate ER evaluation.`,
  },
  {
    id: 'ambiguous-escalation-rajesh',
    title: 'Post-PCI Stent (Ambiguous Dosage Guardrail Trigger)',
    patient: 'Rajesh Mehta (M/61)',
    diagnosis: 'Acute Coronary Syndrome s/p Drug-Eluting Stent to LAD',
    badge: 'Requires Clinician Review',
    hasEscalation: true,
    summary: 'Contains ambiguous antiplatelet instructions & missing blood thinner dosage that triggers Agent 4 Human Escalation.',
    content: `PATIENT: Rajesh Mehta | DOB: 1965-03-22 | MRN: CR-48210 | DISCHARGE DATE: 2026-10-08
DIAGNOSIS: Coronary Artery Disease, Acute Anterior STEMI, s/p successful Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent (DES) to proximal LAD.
VITALS: BP: 130/82 mmHg | HR: 68 bpm | Temp: 98.6°F | SpO2: 97%
ALLERGIES: Sulfa drugs (rash)

MEDICATIONS:
- Ticagrelor 90mg PO BID x 12 months (DO NOT STOP without cardiologist approval).
- Aspirin: Continue antiplatelet therapy as indicated (WARNING: exact milligram dosage not specified in chart).
- Atorvastatin 80mg PO QHS (once at bedtime).
- Metoprolol Succinate 25mg PO QD (once daily in morning).

FOLLOW-UP & PROCEDURES:
- Fasting Lipid Panel and Serum Creatinine at outpatient lab in 4 weeks.
- Post-discharge Cardiology Clinic visit with Dr. Anita Deshmukh in 10 days.
- Referral: Cardiac Rehabilitation program initiation in 3 weeks.

CARE INSTRUCTIONS:
- Monitor femoral access puncture site for hematoma, active bleeding, or sudden swelling.
- Avoid lifting anything over 10 lbs for 1 week.

WARNING SIGNS:
- Recurrent chest pain, radiating jaw or left arm discomfort, shortness of breath, sudden bleeding from puncture site, or dizziness: Dial 102/108 or report immediately to emergency room.`,
  },
  {
    id: 'appendectomy-ananya',
    title: 'Acute Appendicitis (Appendectomy)',
    patient: 'Ananya Roy (F/28)',
    diagnosis: 'Acute Appendicitis post Laparoscopic Appendectomy',
    badge: 'Rapid Recovery',
    hasEscalation: false,
    summary: 'Cefuroxime oral antibiotics, ultrasound scan in 7 days, surgical clinic check in 10 days.',
    content: `PATIENT: Ananya Roy | DOB: 1998-11-19 | MRN: AP-1192 | DISCHARGE DATE: 2026-10-09
DIAGNOSIS: Acute Suppurative Appendicitis post Laparoscopic Appendectomy.
VITALS: BP: 118/74 mmHg | Pulse: 78 bpm | Temp: 98.2°F | SpO2: 99%
ALLERGIES: Penicillin (Urticaria)

MEDICATIONS:
- Cefuroxime Axetil 500mg PO BID x 7 days (take with food).
- Ibuprofen 400mg PO TID PRN with food for moderate incision tenderness (maximum 3 tablets per day).

FOLLOW-UP:
- Ultrasound Pelvis/Abdomen scan in 7 days to confirm absence of fluid collection.
- Surgical Clinic follow-up check in 10 days for wound check and clearance.

CARE INSTRUCTIONS:
- Keep surgical incisions dry for 72 hours.
- Light walking encouraged. No strenuous gym workouts or swimming for 2 weeks.

WARNING SIGNS:
- High fever (>100.5°F), increasing redness or pus drainage from wounds, or severe cramping: Call clinic hotline immediately.`,
  },
  {
    id: 'ortho-priya',
    title: 'Total Knee Arthroplasty (Joint Replacement)',
    patient: 'Priya Swaminathan (F/67)',
    diagnosis: 'Right Total Knee Arthroplasty (TKA) post-op Day 3',
    badge: 'Physiotherapy & Anticoagulation',
    hasEscalation: false,
    summary: 'Subcutaneous Enoxaparin / Apixaban, Physical Therapy within 48h, DVT red-flags and stitch removal.',
    content: `PATIENT: Priya Swaminathan | DOB: 1959-07-03 | MRN: OR-77341 | DISCHARGE DATE: 2026-10-08
DIAGNOSIS: Severe Right Knee Tricompartmental Osteoarthritis s/p Right Total Knee Arthroplasty.
VITALS: BP: 134/80 mmHg | HR: 76 bpm | SpO2: 98% | Temp: 98.5°F
ALLERGIES: None known

MEDICATIONS:
- Apixaban (Eliquis) 2.5mg PO BID x 14 days for Deep Vein Thrombosis (DVT) prophylaxis.
- Paracetamol 1000mg PO TID scheduled for 10 days.
- Tramadol 37.5mg / Acetaminophen 325mg 1 tab PO PRN for breakthrough pain (max 2 tabs/day).
- Calcium Carbonate 500mg + Vitamin D3 1 tablet daily with lunch.

FOLLOW-UP & REHABILITATION:
- In-home Physiotherapy service initiation within 48 hours (gait training, quad sets, passive knee flexion).
- Orthopedic OPD visit with Dr. Harish Balan in 14 days for staple removal and X-ray Right Knee AP/Lateral.

CARE INSTRUCTIONS:
- Keep waterproof silver dressing in place until Day 14 follow-up. Do not immerse in water.
- Wear graduated compression stockings (TED hose) on bilateral lower extremities during the day.
- Ice surgical knee for 20 minutes, 3 to 4 times daily.

WARNING SIGNS:
- Sudden unilateral calf swelling, severe calf pain, warmth/redness, chest pain, or shortness of breath (DVT/PE warning) requires immediate emergency room evaluation.`,
  },
];

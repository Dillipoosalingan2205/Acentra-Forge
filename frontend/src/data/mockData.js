/**
 * Central mock data store — Phase 4: Healthcare Intelligence & Safe Interpretation.
 *
 * UI components must never import this module directly.
 * Always go through `services/mockApi.js` so the data layer can be
 * swapped for real API calls in Phase 7 without touching the UI.
 *
 * Shapes follow `docs/MOCK_DATA.md`.
 */

/** Patient profile discharged on October 8, 2026 */
export const mockPatient = {
  id: 'PAT-001',
  name: 'John Doe',
  dischargeDate: '2026-10-08',
  documentName: 'John_Doe_Discharge.pdf',
};

/** Summary metrics extracted from the care plan */
export const mockSummary = {
  totalActions: 6,
  pending: 4,
  completed: 1,
  needsReview: 1,
};

/** ------------------------------------------------------------------ */
/* Tasks — 6 items matching the Phase 3 specification exactly.         */
/* ------------------------------------------------------------------ */

/**
 * Task status types: 'pending' | 'completed' | 'needs-review'
 * Task category: appointment | investigation | referral | care-instruction | medication | follow-up
 * Priority: high | medium
 */
export const mockTasks = [
  {
    id: 'TASK-001',
    title: 'Cardiology Follow-up',
    description: 'Follow up with cardiology in 7 days.',
    date: '2026-10-15',
    status: 'pending',
    category: 'appointment',
    priority: 'high',
    confidence: 0.89,
    source: {
      page: 2,
      section: 'Follow-up',
      text: 'Follow up with cardiology in 7 days.',
    },
    sourceReference: 'Discharge Summary · Page 2',
    reviewRequired: false,
  },
  {
    id: 'TASK-002',
    title: 'CBC Blood Test',
    description: 'Complete the INR blood test before the next appointment.',
    date: '2026-10-18',
    status: 'pending',
    category: 'investigation',
    priority: 'medium',
    confidence: 0.88,
    source: {
      page: 2,
      section: 'Investigations',
      text: 'INR to be checked prior to cardiology review.',
    },
    sourceReference: 'Discharge Summary · Page 2',
    reviewRequired: false,
  },
  {
    id: 'TASK-003',
    title: 'Physiotherapy Referral',
    description: 'Cardiac rehabilitation referral to be scheduled within 2 weeks.',
    date: '2026-10-22',
    status: 'pending',
    category: 'referral',
    priority: 'medium',
    confidence: 0.84,
    source: {
      page: 3,
      section: 'Referrals',
      text: 'Refer to cardiac rehabilitation and physiotherapy.',
    },
    sourceReference: 'Discharge Summary · Page 3',
    reviewRequired: false,
  },
  {
    id: 'TASK-004',
    title: 'Wound Care Instructions',
    description: 'Monitor the surgical site dressing as instructed.',
    date: '2026-10-10',
    status: 'pending',
    category: 'care-instruction',
    priority: 'high',
    confidence: 0.90,
    source: {
      page: 3,
      section: 'Care Instructions',
      text: 'Maintain wound hygiene and monitor for signs of infection.',
    },
    sourceReference: 'Discharge Summary · Page 3',
    reviewRequired: false,
  },
  {
    id: 'TASK-005',
    title: 'Medication Review',
    description: 'Please confirm this instruction with your healthcare team.',
    date: '2026-10-25',
    status: 'needs-review',
    category: 'medication',
    priority: 'high',
    confidence: 0.82,
    source: {
      page: 4,
      section: 'Medications',
      text: 'Continue medication as previously advised.',
    },
    sourceReference: 'Discharge Summary · Page 4',
    reviewRequired: true,
  },
  {
    id: 'TASK-006',
    title: 'Discharge Follow-up',
    description: 'Confirm recovery progress with the care team.',
    date: '2026-10-08',
    status: 'completed',
    category: 'follow-up',
    priority: 'medium',
    confidence: 0.87,
    source: {
      page: 4,
      section: 'Diet and Fluids',
      text: 'Monitor daily weight.',
    },
    sourceReference: 'Discharge Summary · Page 4',
    reviewRequired: false,
  },
];

/** Task items extracted from the discharge care plan. */
export const mockActionItems = [
  {
    id: 'TASK-001',
    title: 'Cardiology Follow-up',
    description: 'Follow up with cardiology in 7 days.',
    date: '2026-10-15',
    status: 'pending',
    category: 'appointment',
    priority: 'high',
    confidence: 0.89,
    source: {
      page: 2,
      section: 'Follow-up',
      text: 'Follow up with cardiology in 7 days.',
    },
    sourceReference: 'Discharge Summary · Page 2',
    reviewRequired: false,
  },
  {
    id: 'TASK-002',
    title: 'CBC Blood Test',
    description: 'Complete the INR blood test before the next appointment.',
    date: '2026-10-18',
    status: 'pending',
    category: 'investigation',
    priority: 'medium',
    confidence: 0.88,
    source: {
      page: 2,
      section: 'Investigations',
      text: 'INR to be checked prior to cardiology review.',
    },
    sourceReference: 'Discharge Summary · Page 2',
    reviewRequired: false,
  },
  {
    id: 'TASK-003',
    title: 'Physiotherapy Referral',
    description: 'Cardiac rehabilitation referral to be scheduled within 2 weeks.',
    date: '2026-10-22',
    status: 'pending',
    category: 'referral',
    priority: 'medium',
    confidence: 0.84,
    source: {
      page: 3,
      section: 'Referrals',
      text: 'Refer to cardiac rehabilitation and physiotherapy.',
    },
    sourceReference: 'Discharge Summary · Page 3',
    reviewRequired: false,
  },
  {
    id: 'TASK-004',
    title: 'Wound Care Instructions',
    description: 'Monitor the surgical site dressing as instructed.',
    date: '2026-10-10',
    status: 'pending',
    category: 'care-instruction',
    priority: 'high',
    confidence: 0.90,
    source: {
      page: 3,
      section: 'Care Instructions',
      text: 'Maintain wound hygiene and monitor for signs of infection.',
    },
    sourceReference: 'Discharge Summary · Page 3',
    reviewRequired: false,
  },
  {
    id: 'TASK-005',
    title: 'Medication Review',
    description: 'Please confirm this instruction with your healthcare team.',
    date: '2026-10-25',
    status: 'needs-review',
    category: 'medication',
    priority: 'high',
    confidence: 0.82,
    source: {
      page: 4,
      section: 'Medications',
      text: 'Continue medication as previously advised.',
    },
    sourceReference: 'Discharge Summary · Page 4',
    reviewRequired: true,
  },
  {
    id: 'TASK-006',
    title: 'Discharge Follow-up',
    description: 'Confirm recovery progress with the care team.',
    date: '2026-10-08',
    status: 'completed',
    category: 'follow-up',
    priority: 'medium',
    confidence: 0.87,
    source: {
      page: 4,
      section: 'Diet and Fluids',
      text: 'Monitor daily weight.',
    },
    sourceReference: 'Discharge Summary · Page 4',
    reviewRequired: false,
  },
];

/** ------------------------------------------------------------------ */
/* Timeline — condensed discharge event stream                       */
/* ------------------------------------------------------------------ */

export const mockTimeline = [
  {
    id: 'TIME-000',
    date: '2026-10-08',
    title: 'Hospital discharge',
    type: 'discharge',
    status: 'completed',
  },
];

/** ------------------------------------------------------------------ */
/* Instructions — original and simplified wording                     */
/* ------------------------------------------------------------------ */

export const mockInstructions = [
  {
    id: 'INS-000',
    category: 'Appointment',
    originalText: 'Cardiology review in 7 days.',
    simplifiedText: 'Your discharge summary says you should have a cardiology review in 7 days.',
    language: 'en',
    confidence: 0.89,
    source: {
      page: 2,
      section: 'Follow-up',
      text: 'Cardiology review in 7 days.',
    },
    sourceReference: 'Discharge Summary · Page 2',
    reviewRequired: false,
    translations: {
      ta: 'உங்கள் டிஸ்சார்ஜ் சுருக்கம் 7 நாட்களில் இதய மருத்துவ பரிசோதனை செய்ய வேண்டும் என்று கூறுகிறது.',
      hi: 'आपके डिस्चार्ज सारांश के अनुसार 7 दिनों में कार्डियोलॉजी समीक्षा होनी चाहिए।',
    },
  },
  {
    id: 'INS-001',
    category: 'Care Instructions',
    originalText: 'Maintain wound hygiene and monitor for signs of infection.',
    simplifiedText: 'Keep the wound clean and dry as instructed by your care team.',
    language: 'en',
    confidence: 0.90,
    source: {
      page: 3,
      section: 'Care Instructions',
      text: 'Maintain wound hygiene and monitor for signs of infection.',
    },
    sourceReference: 'Discharge Summary · Page 3',
    reviewRequired: false,
    translations: {
      ta: 'உங்கள் சிகிச்சை குழு கூறியபடி காயத்தை சுத்தமாகவும் உலர்வாகவும் வைத்திருங்கள்.',
      hi: 'घाव को साफ और सूखा रखें जैसा कि आपके देखभाल टीम ने निर्देशित किया है।',
    },
  },
  {
    id: 'INS-002',
    category: 'Diet and Fluids',
    originalText: 'Restrict daily fluid intake to 1.5 litres and monitor daily weight.',
    simplifiedText: 'Limit how much you drink to about 1.5 litres a day, and weigh yourself daily.',
    language: 'en',
    confidence: 0.86,
    source: {
      page: 4,
      section: 'Diet and Fluids',
      text: 'Restrict daily fluid intake to 1.5 litres and monitor daily weight.',
    },
    sourceReference: 'Discharge Summary · Page 4',
    reviewRequired: false,
    translations: {
      ta: 'ஒரு நாளைக்கு சுமார் 1.5 லிட்டர் அளவுக்கு மட்டுமே தண்ணீர் அருந்துங்கள், தினமும் எடையை அளவிடுங்கள்.',
      hi: 'रोजाना 1.5 लीटर से अधिक तरल पदार्थ का सेवन न करें और अपना वजन दिन में एक बार चेक करें।',
    },
  },
  {
    id: 'INS-003',
    category: 'Activity',
    originalText: 'Avoid heavy lifting and strenuous activity for 4 weeks.',
    simplifiedText: null, // Low confidence, needs human review
    language: 'en',
    confidence: 0.81,
    source: {
      page: 5,
      section: 'Activity Guidelines',
      text: 'Avoid heavy lifting and strenuous activity for 4 weeks.',
    },
    sourceReference: 'Discharge Summary · Page 5',
    reviewRequired: true,
    translations: {
      ta: null,
      hi: null,
    },
  },
];

/** ------------------------------------------------------------------ */
/* Medications from the discharge summary                            */
/** ------------------------------------------------------------------ */

export const mockMedications = [
  {
    id: 'MED-001',
    category: 'Medication',
    originalText: 'Continue as prescribed.',
    simplifiedText: 'Your discharge summary says to continue your medications as prescribed.',
    language: 'en',
    confidence: 0.88,
    source: {
      page: 4,
      text: 'Continue as prescribed.',
    },
    sourceReference: 'Discharge Summary · Page 4',
    reviewRequired: false,
    translations: {
      ta: 'நிர்ணயிக்கப்பட்டபடி உங்கள் மருந்துகளை தொடர்ந்து எடுத்துக்கொள்ளுங்கள்.',
      hi: 'निर्धारित अनुसार अपनी दवाइयाँ लेते रहें।',
    },
  },
  {
    id: 'MED-002',
    category: 'Medication',
    originalText: 'Continue medication as previously advised.',
    simplifiedText: null, // Calibrated review confidence (0.82), needs human review. Do not interpret.
    language: 'en',
    confidence: 0.82,
    source: {
      page: 4,
      section: 'Medications',
      text: 'Continue medication as previously advised.',
    },
    sourceReference: 'Discharge Summary · Page 4',
    reviewRequired: true,
    translations: {
      ta: null,
      hi: null,
    },
  },
];

/** Providers associated with the patient's care plan. */
export const mockProviders = [
  {
    id: 'PROV-001',
    name: 'ABC Physiotherapy Center',
    specialty: 'Physiotherapy',
    location: 'Chennai',
    distance: '3.2 km',
    synthetic: true,
  },
  {
    id: 'PROV-002',
    name: 'HeartCare Cardiology Clinic',
    specialty: 'Cardiology',
    location: 'Chennai',
    distance: '1.8 km',
    synthetic: true,
  },
];

/** ------------------------------------------------------------------ */
/* Warning signs from the discharge summary                          */
/* ------------------------------------------------------------------ */

export const mockWarningSigns = [
  {
    id: 'WARN-001',
    category: 'Warning Signs',
    originalText: 'Seek urgent care if you experience sudden shortness of breath or chest pain.',
    simplifiedText: 'Get emergency help right away if you have sudden trouble breathing or chest pain.',
    language: 'en',
    confidence: 0.89,
    source: {
      page: 5,
      section: 'When to Seek Help',
      text: 'Seek urgent care if you experience sudden shortness of breath or chest pain.',
    },
    sourceReference: 'Discharge Summary · Page 5',
    reviewRequired: false,
    translations: {
      ta: 'திடீரென்று மூச்சுத்திணறல் அல்லது நெஞ்சு வலி ஏற்பட்டால் உடனே அவசர உதவியை நாடுங்கள்.',
      hi: 'यदि अचानक सांस फूलना या छाती में दर्द हो तो तुरंत आपातकालीन सेवाएँ संपर्क करें।',
    },
  },
  {
    id: 'WARN-002',
    category: 'Warning Signs',
    originalText: 'Contact your care team if you gain more than 2 kg in 48 hours.',
    simplifiedText: 'Call your care team if your weight increases by more than 2 kilograms in 2 days.',
    language: 'en',
    confidence: 0.85,
    source: {
      page: 5,
      section: 'When to Seek Help',
      text: 'Contact your care team if you gain more than 2 kg in 48 hours.',
    },
    sourceReference: 'Discharge Summary · Page 5',
    reviewRequired: false,
    translations: {
      ta: 'இரண்டு நாட்களில் உங்கள் எடை 2 கிலோவுக்கு மேல் அதிகரித்தால் உங்கள் சிகிச்சை குழுவை தொடர்பு கொள்ளுங்கள்.',
      hi: 'यदि 48 घंटों में आपका वजन 2 किग्रा से अधिक बढ़ जाए तो अपने देखभाल टीम से संपर्क करें।',
    },
  },
];

/** ------------------------------------------------------------------ */
/* Sources extracted from the discharge summary                      */
/* ------------------------------------------------------------------ */

export const mockSources = [
  {
    id: 'SRC-001',
    category: 'tasks',
    categoryLabel: 'Tasks',
    item: 'Cardiology Follow-up',
    page: 2,
    section: 'Follow-up',
    originalText: 'Follow up with cardiology in 7 days.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-002',
    category: 'tasks',
    categoryLabel: 'Tasks',
    item: 'CBC Blood Test',
    page: 2,
    section: 'Investigations',
    originalText: 'INR to be checked prior to cardiology review.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-003',
    category: 'instructions',
    categoryLabel: 'Instructions',
    item: 'Cardiology Review',
    page: 2,
    section: 'Follow-up',
    originalText: 'Cardiology review in 7 days.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-004',
    category: 'instructions',
    categoryLabel: 'Instructions',
    item: 'Wound Care Hygiene',
    page: 3,
    section: 'Care Instructions',
    originalText: 'Maintain wound hygiene and monitor for signs of infection.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-005',
    category: 'instructions',
    categoryLabel: 'Instructions',
    item: 'Fluid Restriction',
    page: 4,
    section: 'Diet and Fluids',
    originalText: 'Restrict daily fluid intake to 1.5 litres and monitor daily weight.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-006',
    category: 'medications',
    categoryLabel: 'Medications',
    item: 'Prescription Continuation',
    page: 4,
    section: 'Medications',
    originalText: 'Continue as prescribed.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-007',
    category: 'medications',
    categoryLabel: 'Medications',
    item: 'Ambiguous Medication Note',
    page: 4,
    section: 'Medications',
    originalText: 'Continue medication as previously advised.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-008',
    category: 'warning-signs',
    categoryLabel: 'Warning Signs',
    item: 'Urgent Symptoms',
    page: 5,
    section: 'When to Seek Help',
    originalText: 'Seek urgent care if you experience sudden shortness of breath or chest pain.',
    documentName: 'John_Doe_Discharge.pdf',
  },
  {
    id: 'SRC-009',
    category: 'warning-signs',
    categoryLabel: 'Warning Signs',
    item: 'Rapid Weight Gain',
    page: 5,
    section: 'When to Seek Help',
    originalText: 'Contact your care team if you gain more than 2 kg in 48 hours.',
    documentName: 'John_Doe_Discharge.pdf',
  },
];

/** ------------------------------------------------------------------ */
/* Reviews (human review queue)                                      */
/* ------------------------------------------------------------------ */

export const mockReviews = [
  {
    id: 'REV-001',
    patientId: 'PAT-001',
    patientName: 'John Doe',
    reason: 'Medication instruction is ambiguous.',
    priority: 'high',
    status: 'open',
    originalText: 'Continue medication as previously advised.',
    aiInterpretation: 'Calibrated extraction confidence (82%). Ambiguous schedule flagged for clinician review.',
    confidence: 0.82,
    source: {
      page: 4,
      section: 'Medications',
      text: 'Continue medication as previously advised.',
    },
  },
];
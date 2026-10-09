export type TaskCategory = 'medication' | 'appointment' | 'test' | 'referral' | 'care_instruction';
export type TaskStatus = 'Pending' | 'Completed' | 'Needs Review';

export interface TimelineTask {
  task_id: string;
  category: TaskCategory;
  original_text: string;
  simplified_text_en: string;
  simplified_text_lang: string;
  due_date: string; // e.g. YYYY-MM-DD or 'Within 3 days', 'Day 10'
  time_of_day?: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'Anytime';
  status: TaskStatus;
  requires_human_escalation: boolean;
  escalation_reason?: string | null;
  reviewed_by_clinician?: boolean;
  clinician_notes?: string;
  matched_providers?: CareProvider[];
  ai_confidence_score?: number; // 0-100% extraction confidence
}

export interface WarningSign {
  symptom: string;
  action_required: string;
  urgency: 'High' | 'Immediate Emergency';
}

export interface ProviderQuery {
  task_id: string;
  specialty_or_facility_needed: string;
  location_hint: string;
}

export interface PatientSummary {
  extracted_patient_id: string;
  patient_name?: string;
  diagnosis?: string;
  discharge_date?: string;
  simplified_english: string;
  simplified_indian_language: string;
}

export interface ClinicalVitals {
  bp?: string;
  pulse?: string;
  temperature?: string;
  spo2?: string;
  blood_sugar?: string;
  allergies?: string[];
}

export interface RecoveryPlan {
  patient_summary: PatientSummary;
  clinical_vitals?: ClinicalVitals;
  timeline_tasks: TimelineTask[];
  warning_signs: WarningSign[];
  provider_matching_queries: ProviderQuery[];
  target_language: string;
  analyzed_at: string;
  pipeline_metadata?: {
    model_used: string;
    total_tasks: number;
    escalated_tasks_count: number;
    safety_score: number;
    ai_confidence_score?: number;
  };
}

export interface CareProvider {
  id: string;
  name: string;
  facility_type: string;
  specialty: string;
  rating: number;
  reviews_count: number;
  distance_km: number;
  phone: string;
  address: string;
  open_hours: string;
  booking_available: boolean;
}

export interface SampleCase {
  id: string;
  title: string;
  patient: string;
  diagnosis: string;
  summary: string;
  badge: string;
  hasEscalation: boolean;
  content: string;
}

/**
 * Real API Service — Integrates frontend with FastAPI backend.
 *
 * Provides typed, normalized asynchronous access to backend endpoints
 * with fallback awareness and structured error handling.
 */

const API_BASE = '/api'

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Standard fetch helper with JSON parsing and HTTP error detection.
 */
async function fetchJson(endpoint, options = {}) {
  const url = endpoint.startsWith('http') || endpoint.startsWith('/health')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}: ${res.statusText}`
      try {
        const errorJson = await res.json()
        errDetail = errorJson.detail || errorJson.message || errDetail
      } catch {
        // use status text
      }
      throw new ApiError(errDetail, res.status)
    }

    return await res.json()
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(err.message || 'Network request failed', 0)
  }
}

/* ------------------------------------------------------------------ */
/* System Health & Status                                             */
/* ------------------------------------------------------------------ */

export const checkHealth = async () => {
  return await fetchJson('/health')
}

/* ------------------------------------------------------------------ */
/* Discharge Upload & Processing Pipeline                             */
/* ------------------------------------------------------------------ */

/**
 * Uploads a discharge PDF and initiates the asynchronous AI extraction pipeline.
 */
export const uploadDischarge = async (file, languagePreference = 'en') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language_preference', languagePreference)

  const res = await fetchJson('/discharge/upload', {
    method: 'POST',
    body: formData,
  })

  return {
    documentId: res.discharge_id,
    patientId: res.patient_id,
    patientName: res.patient_name || null,
    fileName: file?.name || 'discharge_summary.pdf',
    status: res.status,
    message: res.message,
    createdAt: res.created_at,
  }
}

/**
 * Polls the orchestrator state machine status for a processing document.
 */
export const getProcessingStatus = async (documentId) => {
  const res = await fetchJson(`/discharge/${documentId}/status`)

  const stepLabels = {
    document_uploaded: 'Uploading document...',
    extracting_instructions: 'Reading discharge instructions...',
    identifying_followup_actions: 'Identifying follow-up actions...',
    checking_dates: 'Checking dates and details...',
    creating_care_timeline: 'Building follow-up plan...',
    checking_for_unclear_instructions: 'Checking for unclear instructions...',
    preparing_care_plan: 'Finalizing care coordinator plan...',
  }

  const stepsStatus = res.steps_status || {}
  const formattedSteps = Object.keys(stepLabels).map((key) => {
    const statusVal = stepsStatus[key] || 'PENDING'
    return {
      key,
      label: stepLabels[key],
      status: statusVal.toLowerCase(), // 'completed' | 'in_progress' | 'pending'
      done: statusVal === 'COMPLETED',
      active: statusVal === 'IN_PROGRESS',
    }
  })

  const isCompleted = res.progress_percentage >= 100 || res.current_step === 'PREPARING_CARE_PLAN'

  return {
    documentId: res.discharge_id,
    patientId: res.patient_id,
    patientName: res.patient_name || null,
    currentStep: res.current_step,
    progressPercentage: res.progress_percentage,
    steps: formattedSteps,
    error: res.error,
    isCompleted,
  }
}

/**
 * Retrieves discharge document metadata and associated patient ID.
 */
export const getDocument = async (documentId) => {
  const res = await fetchJson(`/discharge/${documentId}`)
  return {
    documentId: res.documentId || documentId,
    patientId: res.patientId || 'demo',
    patientName: res.patientName || null,
    fileName: res.fileName,
    status: res.status,
    createdAt: res.createdAt,
  }
}

/* ------------------------------------------------------------------ */
/* Patient & Care Plan                                                */
/* ------------------------------------------------------------------ */

export const getPatient = async (patientId) => {
  const res = await fetchJson(`/patients/${patientId}`)
  return {
    id: res.id,
    actualId: res.actualPatientId,
    name: res.name,
    dischargeDate: res.dischargeDate,
    documentName: res.documentName,
    status: res.status,
  }
}

export const getPatientPlan = async (patientId, lang = 'en') => {
  const res = await fetchJson(`/patients/${patientId}/plan?lang=${lang}`)

  const patient = {
    id: res.patient_id,
    name: res.patient_name,
    dischargeDate: res.discharge_date,
    documentName: 'Discharge Summary',
  }

  const summary = {
    totalActions: res.metrics.total_actions,
    pending: res.metrics.pending,
    completed: res.metrics.completed,
    needsReview: res.metrics.needs_review,
  }

  let nextAction = null
  if (res.next_upcoming_action) {
    const a = res.next_upcoming_action
    nextAction = {
      id: a.task_id,
      title: a.title,
      date: a.due_date,
      category: a.category?.toLowerCase() || 'appointment',
      status: a.status?.toLowerCase() || 'pending',
    }
  }

  return {
    patient,
    summary,
    nextAction,
    careInstructions: res.care_instructions || [],
    warningSigns: res.warning_signs || null,
  }
}

/* ------------------------------------------------------------------ */
/* Tasks & Action Items                                               */
/* ------------------------------------------------------------------ */

export const getTasks = async (patientId, status = 'All', category = null) => {
  let url = `/patients/${patientId}/tasks?status=${encodeURIComponent(status)}`
  if (category) {
    url += `&category=${encodeURIComponent(category)}`
  }

  const res = await fetchJson(url)
  const rawTasks = res.tasks || []

  return rawTasks.map((t) => {
    const lowerStatus = t.status === 'Needs Review' ? 'needs-review' : t.status.toLowerCase()
    const lowerCategory = t.category.toLowerCase().replace(/\s+/g, '-')
    const isNeedsReview = lowerStatus === 'needs-review' || t.clarification_needed

    return {
      id: t.id,
      title: t.title,
      description: t.source_text || t.action_type || `${t.category} follow-up`,
      date: t.due_date,
      status: isNeedsReview ? 'needs-review' : lowerStatus,
      category: lowerCategory,
      priority: isNeedsReview ? 'high' : 'medium',
      confidence: t.confidence_score ?? (isNeedsReview ? 0.82 : 0.89),
      source: {
        page: t.source_page || 1,
        section: t.category,
        text: t.source_text || t.title,
      },
      sourceReference: `Discharge Summary · Page ${t.source_page || 1}`,
      reviewRequired: isNeedsReview,
      clarificationNeeded: t.clarification_needed,
    }
  })
}

export const updateTaskStatus = async (taskId, status, notes = null) => {
  // Normalize status for backend
  const statusMap = {
    pending: 'Pending',
    completed: 'Completed',
    'needs-review': 'Needs Review',
    'needs review': 'Needs Review',
  }
  const backendStatus = statusMap[status.toLowerCase()] || status

  const res = await fetchJson(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: backendStatus,
      notes: notes,
    }),
  })

  return {
    taskId: res.id,
    status: res.updated_status.toLowerCase().replace(/\s+/g, '-'),
    updatedAt: res.updated_at,
    success: true,
  }
}

/* ------------------------------------------------------------------ */
/* Human Review Queue                                                 */
/* ------------------------------------------------------------------ */

export const getReviews = async (priority = 'All') => {
  const res = await fetchJson(`/reviews?priority=${encodeURIComponent(priority)}`)
  const cases = res.review_cases || []

  return cases.map((c) => ({
    id: c.case_id,
    caseId: c.case_id,
    patientId: c.patient_id,
    patientName: 'Patient ' + c.patient_id.slice(0, 8),
    reason: c.reason,
    originalInstruction: c.original_instruction,
    aiInterpretation: c.ai_interpretation,
    confidenceScore: c.confidence_score ?? 0.82,
    confidence: c.confidence_score ?? 0.82,
    priority: c.priority.toLowerCase(),
    createdAt: c.created_at,
  }))
}

export const getReview = async (reviewId) => {
  const c = await fetchJson(`/reviews/${reviewId}`)
  return {
    id: c.case_id,
    caseId: c.case_id,
    patientId: c.patient_id,
    patientName: 'Patient ' + c.patient_id.slice(0, 8),
    reason: c.reason,
    originalInstruction: c.original_instruction,
    aiInterpretation: c.ai_interpretation,
    confidenceScore: c.confidence_score ?? 0.82,
    confidence: c.confidence_score ?? 0.82,
    priority: c.priority.toLowerCase(),
    createdAt: c.created_at,
  }
}

export const resolveReview = async (reviewId, action, reviewerNotes = '', resolvedValues = null) => {
  const payload = {
    action: action.toUpperCase(), // 'APPROVE' | 'OVERRIDE' | 'REJECT' | 'REQUEST_CLARIFICATION'
    reviewer_notes: reviewerNotes,
    resolved_values: resolvedValues ? {
      due_date: resolvedValues.dueDate || resolvedValues.due_date,
      override_instruction: resolvedValues.overrideInstruction || resolvedValues.override_instruction,
    } : null,
  }

  const res = await fetchJson(`/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return res
}

/* ------------------------------------------------------------------ */
/* Provider Finder                                                    */
/* ------------------------------------------------------------------ */

export const searchProviders = async ({ specialty = null, location = null, radiusKm = 10.0 } = {}) => {
  const params = new URLSearchParams()
  if (specialty) params.append('specialty', specialty)
  if (location) params.append('location', location)
  if (radiusKm) params.append('radius_km', radiusKm)

  const res = await fetchJson(`/providers/search?${params.toString()}`)
  return {
    disclaimer: res.disclaimer,
    providers: (res.providers || []).map((p) => ({
      id: p.id,
      name: p.name,
      specialty: p.specialty,
      facilityType: p.facility_type,
      address: p.address,
      distanceKm: p.distance_km,
      distance: `${p.distance_km} km`,
      rating: p.rating,
      contact: p.contact_synthetic,
      synthetic: true,
    })),
  }
}

/* ------------------------------------------------------------------ */
/* Instructions, Medications & Warning Signs                          */
/* ------------------------------------------------------------------ */

export const getInstructions = async (patientId, lang = 'en') => {
  const plan = await fetchJson(`/patients/${patientId}/plan?lang=${lang}`)
  const items = plan.care_instructions || []

  return items.map((item, idx) => ({
    id: item.id || `INS-00${idx + 1}`,
    category: item.category || 'Discharge Guidance',
    originalText: item.original_text,
    simplifiedText: item.simplified_text,
    language: item.language || lang,
    confidence: item.confidence ?? 0.88,
    source: {
      page: item.source_citation?.page || 1,
      section: item.category,
      text: item.source_citation?.raw_quote || item.original_text,
    },
    sourceReference: `Discharge Summary · Page ${item.source_citation?.page || 1}`,
    reviewRequired: false,
    translations: {
      en: item.simplified_text,
    },
  }))
}

export const getWarningSigns = async (patientId) => {
  const plan = await fetchJson(`/patients/${patientId}/plan?lang=en`)
  const w = plan.warning_signs || {}
  const list = w.when_to_seek_immediate_care || []

  return list.map((itemText, idx) => ({
    id: `WARN-00${idx + 1}`,
    category: 'Warning Signs',
    originalText: itemText,
    simplifiedText: itemText,
    language: 'en',
    confidence: w.confidence ?? 0.89,
    source: {
      page: w.source_citation?.page || 1,
      section: 'When to Seek Help',
      text: w.source_citation?.raw_quote || itemText,
    },
    sourceReference: `Discharge Summary · Page ${w.source_citation?.page || 1}`,
    reviewRequired: false,
    disclaimer: w.disclaimer,
  }))
}

export const getSources = async (patientId) => {
  const plan = await fetchJson(`/patients/${patientId}/plan?lang=en`)
  const tasks = await getTasks(patientId)

  return [
    {
      id: 'SRC-001',
      title: 'Discharge Summary Document',
      patientName: plan.patient_name,
      documentName: 'Hospital Discharge Summary.pdf',
      dischargeDate: plan.discharge_date,
      extractedItemsCount: tasks.length + (plan.care_instructions?.length || 0),
      confidenceAverage: 0.88,
    },
  ]
}

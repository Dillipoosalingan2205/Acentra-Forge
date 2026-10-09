/**
 * Hybrid API Adapter — Bridges real FastAPI backend with seamless mock fallback.
 *
 * Tries the real backend API via `api.js` first. If the backend is running,
 * live SQLite/synthetic data is returned. If the backend is unreachable or returns
 * an error, it seamlessly falls back to the deterministic local mock data store.
 */

import * as realApi from './api.js'
import {
  mockPatient,
  mockSummary,
  mockActionItems,
  mockTimeline,
  mockInstructions,
  mockMedications,
  mockProviders,
  mockReviews,
  mockSources,
  mockWarningSigns,
} from '../data/mockData.js'

export class ApiError extends Error {
  constructor(message, status = 404) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const PATIENT_ROUTE_IDS = ['demo', 'PAT-001']
const DOCUMENT_ROUTE_IDS = ['demo', 'DOC-001']

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getActivePatient = () => {
  let storedName = ''
  let storedDoc = ''
  try {
    storedName = localStorage.getItem('aegis_last_patient_name') || ''
    storedDoc = localStorage.getItem('aegis_last_doc_id') || ''
  } catch {}
  return {
    ...mockPatient,
    name: storedName || mockPatient.name,
    documentName: storedDoc && storedDoc !== 'demo' ? 'Discharge Summary' : mockPatient.documentName,
  }
}

/* ------------------------------------------------------------------ */
/* Documents & Upload                                                 */
/* ------------------------------------------------------------------ */

export const uploadDischarge = async (file, languagePreference = 'en') => {
  try {
    const res = await realApi.uploadDischarge(file, languagePreference)
    if (res?.patientName) {
      try {
        localStorage.setItem('aegis_last_patient_name', res.patientName)
        localStorage.setItem('aegis_last_patient_id', res.patientId)
      } catch {}
    }
    return res
  } catch (err) {
    console.warn('[API fallback] uploadDischarge falling back to mock:', err.message)
    await delay(350)
    let parsedName = mockPatient.name
    if (file?.name) {
      const clean = file.name
        .replace(/\.pdf$/i, '')
        .replace(/sample_\d+_/i, '')
        .replace(/[_-]/g, ' ')
        .trim()
      if (clean) {
        parsedName = clean.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      }
    }
    try {
      localStorage.setItem('aegis_last_patient_name', parsedName)
      localStorage.setItem('aegis_last_patient_id', 'demo')
    } catch {}
    return {
      documentId: 'demo',
      fileName: file?.name || mockPatient.documentName,
      patientId: 'demo',
      patientName: parsedName,
      status: 'PROCESSING',
    }
  }
}

export const getDocument = async (documentId) => {
  try {
    const res = await realApi.getDocument(documentId)
    if (res?.patientName) {
      try { localStorage.setItem('aegis_last_patient_name', res.patientName) } catch {}
    }
    return res
  } catch (err) {
    console.warn('[API fallback] getDocument falling back to mock:', err.message)
    await delay(150)
    const active = getActivePatient()
    return {
      documentId,
      patientId: active.id,
      patientName: active.name,
    }
  }
}

export const getProcessingStatus = async (documentId) => {
  try {
    return await realApi.getProcessingStatus(documentId)
  } catch (err) {
    console.warn('[API fallback] getProcessingStatus falling back to mock state machine:', err.message)
    await delay(250)
    const active = getActivePatient()
    const steps = [
      { label: 'Uploading document...', done: true, active: false },
      { label: 'Reading discharge instructions...', done: true, active: false },
      { label: 'Identifying follow-up actions...', done: true, active: false },
      { label: 'Checking dates and details...', done: true, active: false },
      { label: 'Building follow-up plan...', done: true, active: false },
      { label: 'Checking for unclear instructions...', done: true, active: false },
      { label: 'Finalizing care coordinator plan...', done: true, active: false },
    ]
    return {
      documentId,
      patientId: active.id,
      patientName: active.name,
      progressPercentage: 100,
      steps: steps.map((s) => ({ ...s, status: 'completed' })),
      isCompleted: true,
    }
  }
}

/* ------------------------------------------------------------------ */
/* Patient & Care Plan                                                */
/* ------------------------------------------------------------------ */

export const getPatient = async (id) => {
  try {
    const res = await realApi.getPatient(id)
    if (res?.name) {
      try { localStorage.setItem('aegis_last_patient_name', res.name) } catch {}
    }
    return res
  } catch (err) {
    console.warn('[API fallback] getPatient falling back to mock:', err.message)
    await delay(200)
    return getActivePatient()
  }
}

export const getPatientPlan = async (id, lang = 'en') => {
  try {
    const livePlan = await realApi.getPatientPlan(id, lang)
    const liveTasks = await realApi.getTasks(id)

    if (livePlan?.patient?.name) {
      try { localStorage.setItem('aegis_last_patient_name', livePlan.patient.name) } catch {}
    }

    return {
      patient: livePlan.patient,
      summary: livePlan.summary,
      nextAction: livePlan.nextAction || liveTasks.find((t) => t.status === 'pending') || null,
      recentTasks: liveTasks.slice(0, 3),
      timelinePreview: liveTasks.slice(0, 3).map((t) => ({
        id: t.id,
        title: t.title,
        date: t.date,
        status: t.status,
        category: t.category,
      })),
      careInstructions: livePlan.careInstructions,
      warningSigns: livePlan.warningSigns,
    }
  } catch (err) {
    console.warn('[API fallback] getPatientPlan falling back to mock:', err.message)
    await delay(250)
    const active = getActivePatient()
    return {
      patient: active,
      summary: mockSummary,
      nextAction: mockActionItems.find((t) => t.status === 'pending') || null,
      recentTasks: mockActionItems.slice(0, 3),
      timelinePreview: mockTimeline.slice(0, 3),
      careInstructions: mockInstructions,
      warningSigns: mockWarningSigns,
    }
  }
}

export const getTasks = async (id, status = 'All') => {
  try {
    return await realApi.getTasks(id, status)
  } catch (err) {
    console.warn('[API fallback] getTasks falling back to mock:', err.message)
    await delay(200)
    if (!PATIENT_ROUTE_IDS.includes(id)) {
      throw new ApiError(`Unknown patient id: ${id}`)
    }
    return mockActionItems
  }
}

export const getTimeline = async (id) => {
  try {
    const tasks = await realApi.getTasks(id)
    if (tasks && tasks.length > 0) {
      return tasks.map((t) => ({
        id: t.id,
        title: t.title,
        date: t.date,
        status: t.status,
        category: t.category,
        priority: t.priority,
        source: t.sourceReference,
      }))
    }
    return mockTimeline
  } catch (err) {
    console.warn('[API fallback] getTimeline falling back to mock:', err.message)
    await delay(200)
    return mockTimeline
  }
}

/* ------------------------------------------------------------------ */
/* Information & Safety                                               */
/* ------------------------------------------------------------------ */

export const getInstructions = async (id, lang = 'en') => {
  try {
    const live = await realApi.getInstructions(id, lang)
    if (live && live.length > 0) return live
    return mockInstructions
  } catch (err) {
    console.warn('[API fallback] getInstructions falling back to mock:', err.message)
    await delay(200)
    return mockInstructions
  }
}

export const getMedications = async (id) => {
  try {
    const tasks = await realApi.getTasks(id, 'All', 'Medication')
    if (tasks && tasks.length > 0) {
      return tasks.map((t, idx) => ({
        id: t.id || `MED-00${idx + 1}`,
        category: 'Medication',
        originalText: t.source?.text || t.title,
        simplifiedText: t.reviewRequired ? null : t.description,
        language: 'en',
        confidence: t.confidence,
        source: t.source,
        sourceReference: t.sourceReference,
        reviewRequired: t.reviewRequired,
      }))
    }
    return mockMedications
  } catch (err) {
    console.warn('[API fallback] getMedications falling back to mock:', err.message)
    await delay(200)
    return mockMedications
  }
}

export const getWarningSigns = async (id) => {
  try {
    const live = await realApi.getWarningSigns(id)
    if (live && live.length > 0) return live
    return mockWarningSigns
  } catch (err) {
    console.warn('[API fallback] getWarningSigns falling back to mock:', err.message)
    await delay(200)
    return mockWarningSigns
  }
}

export const getSources = async (id) => {
  try {
    const live = await realApi.getSources(id)
    if (live && live.length > 0) return live
    return mockSources
  } catch (err) {
    console.warn('[API fallback] getSources falling back to mock:', err.message)
    await delay(200)
    return mockSources
  }
}

export const getProviders = async (id) => {
  try {
    const live = await realApi.searchProviders()
    if (live && live.providers && live.providers.length > 0) {
      return live.providers
    }
    return mockProviders
  } catch (err) {
    console.warn('[API fallback] getProviders falling back to mock:', err.message)
    await delay(200)
    return mockProviders
  }
}

/* ------------------------------------------------------------------ */
/* Human Review & Task Status                                         */
/* ------------------------------------------------------------------ */

export const getReviews = async (priority = 'All', patientId = null) => {
  try {
    const live = await realApi.getReviews(priority, patientId)
    if (live && live.length > 0) return live
    if (patientId && patientId !== 'All' && patientId.toLowerCase() !== 'demo') {
      return mockReviews.filter((r) => r.patientId === patientId)
    }
    return mockReviews
  } catch (err) {
    console.warn('[API fallback] getReviews falling back to mock:', err.message)
    await delay(200)
    if (patientId && patientId !== 'All' && patientId.toLowerCase() !== 'demo') {
      return mockReviews.filter((r) => r.patientId === patientId)
    }
    return mockReviews
  }
}

export const getReview = async (reviewId) => {
  try {
    return await realApi.getReview(reviewId)
  } catch (err) {
    console.warn('[API fallback] getReview falling back to mock:', err.message)
    await delay(200)
    const review = mockReviews.find((r) => r.id === reviewId)
    if (!review) {
      throw new ApiError(`Review ${reviewId} not found.`)
    }
    return review
  }
}

export const updateTaskStatus = async (taskId, status) => {
  try {
    const res = await realApi.updateTaskStatus(taskId, status)
    const mTask = mockActionItems.find((t) => t.id === taskId)
    if (mTask) {
      mTask.status = status.toLowerCase()
    }
    return res
  } catch (err) {
    console.warn('[API fallback] updateTaskStatus falling back to local mock:', err.message)
    await delay(150)
    const mTask = mockActionItems.find((t) => t.id === taskId)
    if (mTask) {
      mTask.status = status.toLowerCase()
    }
    return { taskId, status, success: true }
  }
}

export const resolveReviewCase = async (reviewId, action, reviewerNotes = '', resolvedValues = null) => {
  let result = null
  try {
    result = await realApi.resolveReview(reviewId, action, reviewerNotes, resolvedValues)
  } catch (err) {
    console.warn('[API fallback] resolveReviewCase falling back:', err.message)
    await delay(200)
    result = { case_id: reviewId, resolution_status: 'RESOLVED', reviewer_notes: reviewerNotes }
  }

  // Update in-memory mock data so mock fallback also reflects the resolution
  let affectedPatientId = null
  try {
    const rev = mockReviews.find((r) => r.id === reviewId)
    if (rev) {
      affectedPatientId = rev.patientId
      rev.status = action === 'REJECT' ? 'rejected' : 'resolved'
      rev.reviewerNotes = reviewerNotes
    }
    const taskNeedsRev = mockActionItems.find((t) => t.status === 'needs-review' || t.reviewRequired)
    if (taskNeedsRev && ['APPROVE', 'OVERRIDE'].includes(action.toUpperCase())) {
      taskNeedsRev.status = 'pending'
      taskNeedsRev.reviewRequired = false
      taskNeedsRev.clarificationNeeded = false
      taskNeedsRev.confidence = 0.90
      if (resolvedValues?.dueDate) {
        taskNeedsRev.date = resolvedValues.dueDate
      }
      if (resolvedValues?.overrideInstruction) {
        taskNeedsRev.title = resolvedValues.overrideInstruction
      }
    }
  } catch (e) {
    // Ignore any mock state sync failure
  }

  // Broadcast event across all components and pages
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aegis:review-resolved', {
        detail: {
          reviewId,
          patientId: affectedPatientId || result?.patient_id,
          action,
          reviewerNotes,
          resolvedValues,
          updatedTaskId: result?.updated_task_id,
        },
      }),
    )
  }

  return result
}
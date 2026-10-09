import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Calendar,
  Send,
} from 'lucide-react'

import Card from '@/components/common/Card.jsx'
import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import LoadingState from '@/components/common/LoadingState.jsx'
import { useApp } from '@/context/appContext.js'
import { getReview, resolveReviewCase } from '@/services/mockApi.js'

export default function ReviewCase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patientId: sessionPatientId, patientName: sessionPatientName } = useApp()

  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [action, setAction] = useState('APPROVE')
  const [reviewerNotes, setReviewerNotes] = useState('Confirmed instruction with attending physician.')
  const [overrideDate, setOverrideDate] = useState('2026-10-20')
  const [overrideText, setOverrideText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    let active = true

    getReview(id)
      .then((item) => {
        if (active) {
          setReview(item)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Review case not found')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const resolvedValues = action === 'OVERRIDE'
        ? { dueDate: overrideDate, overrideInstruction: overrideText }
        : null

      await resolveReviewCase(id, action, reviewerNotes, resolvedValues)
      setResolved(true)
    } catch (err) {
      alert('Failed to resolve review case: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading review case details..." />
      </div>
    )
  }

  if (error || !review) {
    return (
      <CarePlanNotFound
        title="We couldn't find this review case."
        description={`No open review case with ID ${id} was found in the coordination queue.`}
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-6 space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/reviews"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Review Queue
        </Link>
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.08] pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              Case #{review.id?.slice(0, 8)}
            </span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 text-white border border-white/15">
              Patient: {review.patientName || review.patientId}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ID: {review.patientId}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Clinical Triage & Resolution
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Escalated by AI Coordinator due to uncertain interpretation.
          </p>
        </div>
      </header>

      {resolved ? (
        <Card className="p-8 text-center space-y-4">
          <CheckCircle className="mx-auto h-14 w-14 text-emerald-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Review Case Successfully Resolved</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            The patient care plan has been updated with your clinical confirmation. The quarantined action item has been unblocked.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {sessionPatientId && sessionPatientId !== review.patientId ? (
              <>
                <Link
                  to={`/dashboard/${sessionPatientId}`}
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_20px_rgba(255,255,255,0.3)] hover:bg-[#e4e4e6] transition-all cursor-pointer"
                >
                  Return to your uploaded patient ({sessionPatientName || 'Overview'})
                </Link>
                <Link
                  to={`/dashboard/${review.patientId}`}
                  className="rounded-full px-5 py-2.5 text-xs font-semibold text-zinc-300 bg-[#28282a] border border-white/10 hover:bg-[#323234] hover:text-white transition-all cursor-pointer"
                >
                  View {review.patientName ? `${review.patientName}'s` : 'Patient'} Care Plan
                </Link>
              </>
            ) : (
              <Link
                to={`/dashboard/${review.patientId || sessionPatientId || 'demo'}`}
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_20px_rgba(255,255,255,0.3)] hover:bg-[#e4e4e6] transition-all cursor-pointer"
              >
                View {review.patientName ? `${review.patientName}'s` : 'Patient'} Care Plan
              </Link>
            )}
            <Link
              to="/reviews"
              className="rounded-full px-5 py-2.5 text-xs font-semibold text-zinc-300 bg-[#28282a] border border-white/10 hover:bg-[#323234] hover:text-white transition-all cursor-pointer"
            >
              Return to Review Queue
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 cols: Evidence & Interpretation */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                Escalation Details
              </h2>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-1">Reason for Escalation:</p>
                <p className="text-sm font-semibold text-amber-300">
                  {review.reason || 'Uncertain dosage or vague timing instruction'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-1">Discharge Text Evidence:</p>
                <div className="rounded-xl p-3.5 text-xs text-zinc-200 font-mono bg-black border border-white/10">
                  &quot;{review.originalInstruction}&quot;
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-1">AI Interpretation:</p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {review.aiInterpretation || 'Vague instruction requires clinician clarification prior to setting task due date.'}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2 text-xs text-zinc-500 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  Confidence: <span style={{ fontFamily: 'var(--font-display)' }}>{Math.round((review.confidenceScore || 0.82) * 100)}%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  Quarantined: Safety Guard Enforced
                </span>
              </div>
            </Card>
          </div>

          {/* Right col: Resolution Form */}
          <div className="space-y-4">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Clinician Resolution
                </h2>

                {/* Action Type */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Resolution Action
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full rounded-full px-4 py-2 text-xs bg-[#28282a] border border-white/10 text-white focus:outline-none focus:border-white/40 cursor-pointer"
                  >
                    <option value="APPROVE" className="bg-black text-white">
                      Approve (Confirm Instruction)
                    </option>
                    <option value="OVERRIDE" className="bg-black text-white">
                      Override (Specify Due Date)
                    </option>
                    <option value="REQUEST_CLARIFICATION" className="bg-black text-white">
                      Request Attending Clarification
                    </option>
                  </select>
                </div>

                {/* Conditional Override Date */}
                {action === 'OVERRIDE' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-zinc-400">
                      Confirmed Due Date
                    </label>
                    <input
                      type="date"
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                      className="w-full rounded-full px-4 py-2 text-xs bg-[#28282a] border border-white/10 text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                )}

                {/* Reviewer Notes */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Enter reasoning or clinical verification notes..."
                    className="w-full rounded-2xl p-3 text-xs bg-[#28282a] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_20px_rgba(255,255,255,0.3)] hover:bg-[#e4e4e6] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    'Saving Resolution...'
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Apply Clinical Resolution
                    </>
                  )}
                </button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

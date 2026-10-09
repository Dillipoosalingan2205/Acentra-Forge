import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  Clock,
  ShieldAlert,
  Sparkles,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import Badge from '@/components/common/Badge.jsx'
import Card from '@/components/common/Card.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import LoadingState from '@/components/common/LoadingState.jsx'
import { useApp } from '@/context/appContext.js'
import { getReviews, resolveReviewCase } from '@/services/mockApi.js'
import { cn } from '@/utils/classNames.js'

/**
 * Review Queue — Displays items routed for human clinical judgment.
 */
export default function ReviewQueue() {
  const { patientId: activePatientId, patientName: activePatientName } = useApp()
  const [reviews, setReviews] = useState(null)
  const [failed, setFailed] = useState(false)
  const [resolvedIds, setResolvedIds] = useState(new Set())
  const [resolvingId, setResolvingId] = useState(null)
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'active'

  const loadReviews = () => {
    getReviews()
      .then((items) => setReviews(items))
      .catch(() => setFailed(true))
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleQuickApprove = async (caseId, patientId) => {
    setResolvingId(caseId)
    try {
      await resolveReviewCase(caseId, 'APPROVE', 'Verified by reviewing clinician in triage queue.')
      setResolvedIds((prev) => new Set([...prev, caseId]))
    } catch (err) {
      console.warn('Failed to approve review case:', err)
    } finally {
      setResolvingId(null)
    }
  }

  const activePatientCases = (reviews || []).filter(
    (r) => r.patientId === activePatientId,
  )

  const displayedReviews = (reviews || []).filter((r) => {
    if (filterMode === 'active' && activePatientId) {
      return r.patientId === activePatientId
    }
    return true
  })

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6 animate-fade-in">
      <header className="border-b border-white/10 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Clinical Oversight Queue
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Human Review</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Items the AI coordinator could not confidently interpret, routed safely for human clinical judgment.
          </p>

          {/* Filter options if active uploaded patient is present */}
          {activePatientId && activePatientCases.length > 0 && (
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={cn(
                  'rounded-full px-3.5 py-1 text-xs font-medium transition-all cursor-pointer',
                  filterMode === 'all'
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/5 text-zinc-400 hover:text-white',
                )}
              >
                All Patients ({reviews?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={cn(
                  'rounded-full px-3.5 py-1 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5',
                  filterMode === 'active'
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20',
                )}
              >
                <User className="h-3 w-3" />
                <span>Current: {activePatientName || 'Active Patient'} ({activePatientCases.length})</span>
              </button>
            </div>
          )}
        </div>
        {reviews && (
          <Badge status="review">{`${reviews.filter((r) => !resolvedIds.has(r.id)).length} item${reviews.filter((r) => !resolvedIds.has(r.id)).length === 1 ? '' : 's'} waiting`}</Badge>
        )}
      </header>

      {/* Clinical Safety Protocol Notice */}
      <div className="flex items-start gap-3 rounded-2xl p-4 text-xs text-amber-300 bg-[#14120b] border border-amber-500/30">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-200">Clinical Boundary Protocol</p>
          <p className="mt-0.5 text-amber-400/80">
            Any instruction with ambiguous timing or dosage is automatically quarantined here. Patients are prevented from completing quarantined tasks until a clinician resolves the clarification.
          </p>
        </div>
      </div>

      {failed ? (
        <Card className="p-6">
          <EmptyState
            icon={ClipboardCheck}
            title="Couldn't load the review queue."
            description="Check that the backend server is running on port 8001."
          />
        </Card>
      ) : reviews === null ? (
        <div className="py-12">
          <LoadingState label="Loading review cases from coordination engine…" />
        </div>
      ) : displayedReviews.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Queue Clear</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {filterMode === 'active'
              ? `No open review cases for ${activePatientName || 'the current patient'}.`
              : 'All extracted discharge instructions have been validated with high confidence. No items currently require human triage.'}
          </p>
          {filterMode === 'active' && reviews.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
            >
              View all triage cases ({reviews.length})
            </button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((item) => {
            const isResolved = resolvedIds.has(item.id)
            const isWorking = resolvingId === item.id
            const isHighPriority = item.priority === 'high' || item.priority === 'HIGH'
            const isCurrentPatient = item.patientId === activePatientId

            return (
              <Card
                key={item.id}
                className="p-5 transition-all duration-200"
                style={{
                  opacity: isResolved ? 0.6 : 1,
                  borderColor: isResolved
                    ? 'rgba(16,185,129,0.3)'
                    : isHighPriority
                    ? 'rgba(239,68,68,0.25)'
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: isHighPriority ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: isHighPriority ? '#f87171' : '#fbbf24',
                          border: `1px solid ${isHighPriority ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        }}
                      >
                        {item.priority || 'MEDIUM'} PRIORITY
                      </span>

                      {/* Explicit Patient Attribution Badge */}
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-semibold border flex items-center gap-1',
                          isCurrentPatient
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 text-zinc-300 border-white/10',
                        )}
                      >
                        <User className="h-2.5 w-2.5 text-zinc-400" />
                        <span>{item.patientName || 'Patient'}</span>
                        {isCurrentPatient && (
                          <span className="text-[9px] text-emerald-400 font-bold uppercase ml-0.5">· Current</span>
                        )}
                      </span>

                      <span className="text-xs font-mono text-zinc-500">Case #{item.id?.slice(0, 8)}</span>
                      {isResolved && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          Resolved
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">
                      {item.reason || 'Ambiguous instruction requiring clinical clarification'}
                    </h3>

                    {/* Original discharge text */}
                    <div className="rounded-xl p-3 text-xs text-zinc-200 font-mono bg-black border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                        Original Document Quote:
                      </p>
                      &quot;{item.originalInstruction || 'Continue medication as previously advised.'}&quot;
                    </div>

                    {/* AI interpretation & Confidence */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-white" />
                        AI Confidence: <strong className="text-white" style={{ fontFamily: 'var(--font-display)' }}>{Math.round((item.confidenceScore || item.confidence || 0.82) * 100)}%</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        Quarantined from auto-completion
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <Link
                      to={`/reviews/${item.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_18px_rgba(255,255,255,0.25)] hover:bg-[#e4e4e6] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>Review Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {!isResolved && (
                      <button
                        type="button"
                        disabled={isWorking}
                        onClick={() => handleQuickApprove(item.id, item.patientId)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isWorking ? 'Resolving...' : 'Quick Approve'}
                      </button>
                    )}

                    {isResolved && (
                      <Link
                        to={`/dashboard/${activePatientId || item.patientId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 pt-1"
                      >
                        <span>Return to Care Plan</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

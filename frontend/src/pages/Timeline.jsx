import { useState } from 'react'
import { CalendarClock, CheckCircle2, ChevronDown, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Badge from '@/components/common/Badge.jsx'
import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import LoadingState from '@/components/common/LoadingState.jsx'
import PriorityBadge from '@/components/common/PriorityBadge.jsx'
import { useTaskContext } from '@/context/TaskContext.jsx'
import { useCarePlanGuard } from '@/hooks/useCarePlanGuard.js'
import { cn } from '@/utils/classNames'
import { formatDate } from '@/utils/format.js'

export default function Timeline() {
  const { id } = useParams()
  const { tasks, loading, updateTaskStatus } = useTaskContext()
  const guard = useCarePlanGuard(id)
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // Sort tasks chronologically by date
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date))

  if (guard === 'missing') {
    return <CarePlanNotFound section="timeline" />
  }

  if (guard === 'checking' || loading) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading follow-up timeline…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      {/* Header */}
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
            <CalendarClock className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Roadmap to Recovery
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Follow-up Timeline
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          A chronological roadmap of your discharge follow-up care actions.
        </p>
      </header>

      {/* Timeline items */}
      {sortedTasks.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111113] p-12 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-400">No follow-up actions scheduled in this care plan.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2 sm:before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-800">
          {sortedTasks.map((task) => {
            const isCompleted = task.status === 'completed'
            const isNeedsReview = task.status === 'needs-review'
            const isExpanded = expandedTaskId === task.id

            return (
              <div
                key={task.id}
                className={cn(
                  'relative rounded-2xl border p-5 transition-all duration-300',
                  isCompleted
                    ? 'border-emerald-500/30 bg-[#0d1612]'
                    : isNeedsReview
                    ? 'border-amber-500/30 bg-[#14120b]'
                    : 'border-white/10 bg-[#111113] hover:border-white/20',
                )}
              >
                {/* Timeline node dot */}
                <div
                  className={cn(
                    'absolute -left-[29px] sm:-left-[37px] top-6 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-transform duration-200',
                    isCompleted
                      ? 'border-emerald-400 bg-emerald-500 ring-4 ring-emerald-950/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : isNeedsReview
                      ? 'border-amber-400 bg-amber-500 ring-4 ring-amber-950/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'border-white bg-white ring-4 ring-white/20 shadow-[0_0_10px_rgba(255,255,255,0.6)]',
                  )}
                  aria-hidden="true"
                />

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-400">
                        {formatDate(task.date)}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs font-medium capitalize text-zinc-400">
                        {task.category}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white tracking-tight">{task.title}</h3>
                    <p className="mt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {task.description || 'No detailed instructions provided.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {task.priority && <PriorityBadge priority={task.priority} />}
                    <Badge status={task.status} />

                    <button
                      type="button"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Hide details for ${task.title}`
                          : `Show details for ${task.title}`
                      }
                      className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                    >
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-180')}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3.5 space-y-2 border-t border-white/10 pt-3 text-xs text-zinc-400">
                    <p>
                      <strong className="font-semibold text-zinc-200">Category:</strong>{' '}
                      <span className="capitalize">{task.category}</span>
                    </p>
                    <p>
                      <strong className="font-semibold text-zinc-200">Priority:</strong>{' '}
                      <span className="capitalize">{task.priority}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-zinc-500" />
                      <strong className="font-semibold text-zinc-200">Source:</strong>{' '}
                      <Link
                        to={`/sources/${id || 'demo'}`}
                        className="text-white underline hover:text-zinc-300 transition-colors"
                      >
                        From discharge summary {task.sourceReference ? `(${task.sourceReference.replace('Discharge Summary · ', '')})` : ''}
                      </Link>
                    </p>
                  </div>
                )}

                {/* Timeline Action footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Marked complete in this plan.
                    </span>
                  )}

                  {task.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white text-black font-semibold px-4 py-1.5 text-xs shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_18px_rgba(255,255,255,0.25)] hover:bg-[#e4e4e6] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Complete
                    </button>
                  )}

                  {isNeedsReview && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-amber-400 font-medium">
                        Needs Human Review (locked)
                      </span>
                      {task.category === 'medication' && (
                        <Link
                          to={`/medications/${id || 'demo'}`}
                          className="rounded-full bg-[#28282a] border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-[#323234] transition-colors"
                        >
                          Review Medication
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Patient Timeline Summary Card */}
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111113] p-4 sm:p-5 shadow-lg">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <strong className="text-white font-semibold">{sortedTasks.length} follow-up events</strong> organized in date sequence from discharge through recovery.
        </p>
      </div>
    </div>
  )
}

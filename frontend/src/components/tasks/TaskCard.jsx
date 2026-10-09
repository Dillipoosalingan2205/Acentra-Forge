import { CheckCircle2, FileText, ShieldAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Badge from '@/components/common/Badge.jsx'
import PriorityBadge from '@/components/common/PriorityBadge.jsx'
import { useTaskContext } from '@/context/TaskContext.jsx'
import { cn } from '@/utils/classNames'
import { formatDate } from '@/utils/format.js'

/**
 * TaskCard — displays individual follow-up task.
 * Synchronizes with global TaskContext across Tasks, Timeline, and Dashboard.
 * Styled in dark glassmorphism.
 */
export function TaskCard({ taskId, showActions = true, link }) {
  const { id } = useParams()
  const patientId = id || 'demo'
  const { tasks, updateTaskStatus } = useTaskContext()
  const task = tasks.find((t) => t.id === taskId)

  if (!task) return null

  const isPending = task.status === 'pending'
  const isCompleted = task.status === 'completed'
  const needsReview = task.status === 'needs-review'

  const body = (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white tracking-tight">{task.title}</h3>
          {task.description && (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {task.priority && <PriorityBadge priority={task.priority} />}
          <Badge status={task.status} />
        </div>
      </div>

      {/* Date, Category, and Source Reference */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span>Due: <strong className="font-semibold text-slate-200">{formatDate(task.date)}</strong></span>
          <span className="text-slate-600">•</span>
          <span className="capitalize font-medium text-slate-400">{task.category}</span>
          {task.confidence != null && !needsReview && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400/90 font-medium font-mono text-[11px]">AI: {Math.round(task.confidence * 100)}%</span>
            </>
          )}
        </div>

        {/* Source citation */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <FileText className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <Link
            to={`/sources/${patientId}`}
            className="hover:text-blue-400 text-slate-400 underline transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            From discharge summary
            {task.sourceReference
              ? ` (${task.sourceReference.replace('Discharge Summary · ', '')})`
              : ''}
          </Link>
        </div>
      </div>

      {/* Low-confidence indicator for Needs Review tasks */}
      {needsReview && task.confidence != null && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-950/30 px-3 py-2 text-xs text-amber-300 border border-amber-500/30">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Extraction confidence: <strong>{Math.round(task.confidence * 100)}%</strong> (Flagged for human clinical review)</span>
        </div>
      )}

      {/* Action Footer */}
      {showActions && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Marked complete in this plan.
            </span>
          )}

          {isPending && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                updateTaskStatus(taskId, 'completed')
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white text-black font-semibold px-4 py-1.5 text-xs shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_18px_rgba(255,255,255,0.25)] hover:bg-[#e4e4e6] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              aria-label={`Mark ${task.title} as complete`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark Complete
            </button>
          )}

          {needsReview && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-400 font-medium">
                Needs Human Review
              </span>
              <span className="text-[11px] text-zinc-500 italic">
                (Cannot be completed until verified)
              </span>
              {task.category === 'medication' && (
                <Link
                  to={`/medications/${patientId}`}
                  className="rounded-full bg-[#28282a] border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-[#323234] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Review Instruction
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const cardClasses =
    'rounded-2xl border border-white/10 bg-[#111113] p-5 transition-all hover:border-white/20'

  if (link) {
    return (
      <Link to={link} className={cn(cardClasses, 'block hover:bg-[#18181c]')}>
        {body}
      </Link>
    )
  }

  return <div className={cardClasses}>{body}</div>
}

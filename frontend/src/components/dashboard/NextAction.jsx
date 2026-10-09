import { ArrowRight, Calendar, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import Badge from '@/components/common/Badge.jsx'
import Card from '@/components/common/Card.jsx'
import PriorityBadge from '@/components/common/PriorityBadge.jsx'
import { getButtonClasses } from '@/components/common/buttonStyles.js'
import { formatDate } from '@/utils/format.js'

export default function NextAction({ task, patientId = 'demo', onComplete }) {
  if (!task) {
    return (
      <Card className="p-6">
        <h2 className="text-base font-semibold text-white mb-2">Next Action</h2>
        <p className="text-sm text-slate-400">No pending follow-up actions right now.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Immediate Follow-up
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">Next Action</h2>
        </div>
        <div className="flex items-center gap-2">
          {task.priority && <PriorityBadge priority={task.priority} />}
          <Badge status={task.status || 'pending'} />
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white">{task.title}</h3>
            {task.description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{task.description}</p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>Due: <strong className="font-semibold text-slate-200">{formatDate(task.date)}</strong></span>
              {task.category && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="capitalize">{task.category}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/tasks/${patientId}`}
              className={getButtonClasses({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
            >
              View Task
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            {onComplete && task.status === 'pending' && (
              <button
                type="button"
                onClick={() => onComplete(task.id, 'completed')}
                className={getButtonClasses({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

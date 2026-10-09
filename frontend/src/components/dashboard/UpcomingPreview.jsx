import { Calendar, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Badge from '@/components/common/Badge.jsx'
import Card from '@/components/common/Card.jsx'
import PriorityBadge from '@/components/common/PriorityBadge.jsx'
import { formatDate } from '@/utils/format.js'

export default function UpcomingPreview({ tasks = [], patientId }) {
  const { id } = useParams()
  const pid = patientId || id || 'demo'

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Timeline
          </span>
          <h2 className="text-base font-semibold text-white tracking-tight mt-0.5">Upcoming Actions</h2>
        </div>
        <Link
          to={`/timeline/${pid}`}
          className="text-xs font-semibold text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {upcomingTasks.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-6">No upcoming actions scheduled.</p>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate" title={task.title}>
                    {task.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatDate(task.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {task.priority && <PriorityBadge priority={task.priority} />}
                <Badge status={task.status || 'pending'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

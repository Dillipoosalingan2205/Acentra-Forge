import { CheckCircle2, Clock, FileText } from 'lucide-react'
import Card from '@/components/common/Card.jsx'

export default function RecentActivity({ activities = [] }) {
  const baseActivities = [
    {
      id: 'act-init-1',
      title: 'Discharge summary processed',
      subtitle: 'System successfully parsed medical record',
      time: 'Just now',
      icon: FileText,
      iconColor: 'bg-white/5 border border-white/10 text-white',
    },
    {
      id: 'act-init-2',
      title: 'Follow-up plan created',
      subtitle: 'Extracted appointments, tests, and medication instructions',
      time: 'Just now',
      icon: CheckCircle2,
      iconColor: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    },
  ]

  return (
    <Card className="p-6">
      <div className="border-b border-white/10 pb-3 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          History
        </span>
        <h2 className="text-base font-semibold text-white tracking-tight mt-0.5">Recent Activity</h2>
      </div>

      <div className="space-y-3">
        {/* Dynamic activities if any */}
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3 rounded-xl bg-black/40 border border-white/10 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white">{act.taskTitle || 'Task updated'}</p>
              <p className="text-[11px] text-zinc-400">Completed in follow-up tracker</p>
            </div>
            <span className="text-[11px] text-zinc-500 shrink-0 font-mono">
              {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {/* Standard Phase 2 foundational activity log */}
        {baseActivities.map((act) => {
          const Icon = act.icon
          return (
            <div key={act.id} className="flex items-start gap-3 rounded-xl bg-black/40 border border-white/10 p-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${act.iconColor}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white">{act.title}</p>
                <p className="text-[11px] text-zinc-400">{act.subtitle}</p>
              </div>
              <span className="text-[11px] text-zinc-500 shrink-0 flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                {act.time}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

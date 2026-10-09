import { AlertTriangle, CheckCircle2, Clock, Loader2, ShieldQuestion } from 'lucide-react'

import { cn } from '@/utils/classNames'

/**
 * Semantic status badge. Never relies on color alone:
 * every status carries an icon and a readable label.
 * Tuned for premium dark mode contrast.
 */
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    classes: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30',
  },
  review: {
    label: 'Needs Review',
    icon: ShieldQuestion,
    classes: 'bg-amber-950/70 text-amber-400 border border-amber-500/30',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    classes: 'bg-blue-950/70 text-blue-400 border border-blue-500/30',
  },
  'high-priority': {
    label: 'High Priority',
    icon: AlertTriangle,
    classes: 'bg-rose-950/70 text-rose-400 border border-rose-500/30 font-semibold',
  },
  error: {
    label: 'Error',
    icon: AlertTriangle,
    classes: 'bg-rose-950/80 text-rose-300 border border-rose-500/40',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertTriangle,
    classes: 'bg-rose-950/70 text-rose-400 border border-rose-500/30',
  },
}

export default function Badge({ status, label, className, children, ...props }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-xs transition-colors',
        config.classes,
        className,
      )}
      {...props}
    >
      <Icon
        className={cn('h-3.5 w-3.5', status === 'processing' && 'animate-spin')}
        aria-hidden="true"
      />
      {children ?? label ?? config.label}
    </span>
  )
}

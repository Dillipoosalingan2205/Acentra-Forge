import { cn } from '@/utils/classNames'

/**
 * Priority chip for follow-up tasks. Tuned for dark glass theme.
 */
const PRIORITY_CONFIG = {
  high: { label: 'High', classes: 'bg-rose-950/70 text-rose-300 border border-rose-500/30' },
  medium: { label: 'Medium', classes: 'bg-amber-950/70 text-amber-300 border border-amber-500/30' },
  low: { label: 'Low', classes: 'bg-slate-800/80 text-slate-300 border border-slate-700/60' },
}

export default function PriorityBadge({ priority, className }) {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority ?? 'Unknown',
    classes: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-xs',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

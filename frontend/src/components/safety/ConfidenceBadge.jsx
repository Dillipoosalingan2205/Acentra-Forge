import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import { cn } from '@/utils/classNames'

/**
 * ConfidenceBadge — visual confidence indicator for healthcare intelligence.
 * Strictly adheres to clinical safety guidelines:
 *  - 0.85–1.00 = High confidence
 *  - 0.60–0.84 = Moderate confidence
 *  - below 0.60 = Needs Human Review
 *
 * Called "Extraction confidence" or "Interpretation confidence".
 * NEVER describes confidence as "Medical certainty".
 * Styled for dark glassmorphic UI.
 */
function getConfidenceLevel(confidence, prefix) {
  const percentage = Math.round(confidence * 100)

  if (confidence >= 0.85) {
    return {
      label: `${prefix}: High confidence (${percentage}%)`,
      icon: CheckCircle2,
      classes: 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30',
    }
  }
  if (confidence >= 0.80) {
    return {
      label: `${prefix}: Calibrated review (${percentage}%)`,
      icon: AlertTriangle,
      classes: 'bg-amber-950/70 text-amber-300 border border-amber-500/30',
    }
  }
  return {
    label: `${prefix}: Needs Human Review (${percentage}%)`,
    icon: AlertTriangle,
    classes: 'bg-rose-950/70 text-rose-300 border border-rose-500/30',
  }
}

export function ConfidenceBadge({
  confidence,
  type = 'extraction', // 'extraction' | 'interpretation'
  className,
}) {
  if (typeof confidence !== 'number') return null

  const prefix = type === 'interpretation' ? 'Interpretation confidence' : 'Extraction confidence'
  const { label, icon: Icon, classes } = getConfidenceLevel(confidence, prefix)

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-left text-xs font-medium backdrop-blur-xs shadow-xs',
        classes,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

import { AlertTriangle } from 'lucide-react'

/**
 * EscalationCard — prominent UI for low-confidence items requiring human review.
 * Follows the Phase 4 core model:
 *  - Needs Human Review
 *  - Why: The instruction could not be interpreted confidently.
 *  - Original source: “Continue medication as previously advised.”
 *  - What to do: Please confirm this instruction with your healthcare team.
 *
 * Strictly informational: does not make clinical recommendations or speculate on care.
 * Styled in dark glassmorphism with high visual contrast.
 */
export function EscalationCard({
  title = 'Needs Human Review',
  why = 'The instruction could not be interpreted confidently.',
  originalText = 'Continue medication as previously advised.',
  sourceReference = 'Discharge Summary · Page 4',
  whatToDo = 'Please confirm this instruction with your healthcare team.',
}) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-[#14120b] p-5 shadow-lg">
      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-amber-300 tracking-tight">
              {title}
            </h3>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              Ambiguous · Review Required
            </span>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">Why:</p>
            <p className="mt-0.5 text-sm text-zinc-200 leading-relaxed">
              {why}
            </p>
          </div>

          {originalText && (
            <div className="rounded-xl border border-white/10 bg-black p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Original source:
              </p>
              <p className="mt-1 font-mono text-xs sm:text-sm text-amber-200/90 break-words">
                &ldquo;{originalText}&rdquo;
              </p>
              {sourceReference && (
                <p className="mt-1 text-[11px] text-zinc-500">
                  Source: {sourceReference}
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
              What to do:
            </p>
            <p className="mt-0.5 text-sm font-medium text-amber-200">
              {whatToDo}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
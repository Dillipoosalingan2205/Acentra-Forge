import { AlertCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { getButtonClasses } from '@/components/common/buttonStyles.js'

/**
 * Reusable ErrorState component for displaying friendly error boundaries,
 * failed API calls, and clinical warning states. Styled for dark mode.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this healthcare information. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-xl px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={getButtonClasses({ variant: 'secondary', size: 'sm', className: 'mt-5 gap-1.5' })}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Try Again
        </button>
      )}
    </div>
  )
}

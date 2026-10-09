import { Loader2 } from 'lucide-react'

import { cn } from '@/utils/classNames'

export default function LoadingState({ label = 'Loading…', className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-zinc-400', className)}
    >
      <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden="true" />
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <span className="sr-only">{label}</span>
    </div>
  )
}

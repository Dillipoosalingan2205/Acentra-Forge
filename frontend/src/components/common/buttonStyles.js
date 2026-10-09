import { cn } from '@/utils/classNames'

const base =
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary:
    'bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_22px_rgba(255,255,255,0.32)] hover:bg-slate-100 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_0_28px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'border border-white/15 bg-[#28282a] text-[#c8c8c8] hover:bg-[#323234] hover:text-white hover:border-white/25 hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
  ghost:
    'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white',
  danger:
    'border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 hover:text-white shadow-sm',
}

const sizes = {
  sm: 'h-8 gap-1.5 px-3.5 text-xs',
  md: 'h-10 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2.5 px-7 text-base',
}

/**
 * Shareable class builder so navigational elements (Link, NavLink)
 * can look exactly like a Button without nesting interactive elements.
 */
export function getButtonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(base, variants[variant], sizes[size], className)
}

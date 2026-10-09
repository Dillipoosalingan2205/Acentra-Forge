import { cn } from '@/utils/classNames'

const toneConfig = {
  default: {
    value: 'text-white',
    bg: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.09)',
    glow: 'none',
  },
  blue: {
    value: 'text-white',
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.12)',
    glow: '0 0 20px rgba(255, 255, 255, 0.03)',
  },
  emerald: {
    value: 'text-emerald-400',
    bg: 'rgba(16, 185, 129, 0.06)',
    border: 'rgba(16, 185, 129, 0.2)',
    glow: '0 0 20px rgba(16, 185, 129, 0.08)',
  },
  amber: {
    value: 'text-amber-400',
    bg: 'rgba(245, 158, 11, 0.06)',
    border: 'rgba(245, 158, 11, 0.2)',
    glow: '0 0 20px rgba(245, 158, 11, 0.08)',
  },
}

export default function SummaryCard({ title, value, tone = 'default', subtitle }) {
  const config = toneConfig[tone] || toneConfig.default

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/20"
      style={{
        background: 'rgba(17, 17, 19, 0.9)',
        border: `1px solid ${config.border}`,
        boxShadow: config.glow,
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
      <p
        className={cn('mt-2 text-3xl sm:text-4xl font-normal tracking-tight', config.value)}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  )
}

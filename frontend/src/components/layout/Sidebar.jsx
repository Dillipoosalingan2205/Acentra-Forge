import { NavLink } from 'react-router-dom'

import { navConfig } from '@/components/navigation/navConfig.js'
import { useApp } from '@/context/appContext.js'
import { cn } from '@/utils/classNames'

/**
 * Minimalist dark sidebar matching the intelligence theme.
 */
export default function Sidebar() {
  const { patientId } = useApp()

  return (
    <aside
      className="hidden w-64 shrink-0 lg:block styled-scroll bg-black"
      style={{
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <nav
        aria-label="Main navigation"
        className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 styled-scroll"
      >
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Care Coordination
        </p>
        <ul className="space-y-1">
          {navConfig.map((item) => {
            const Icon = item.icon
            const to = item.to.replace(':id', patientId)

            return (
              <li key={item.to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn('h-4 w-4 shrink-0', isActive ? 'text-black' : 'text-slate-400')}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                      {item.badge != null && (
                        <span
                          className={cn(
                            'ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[9px] font-bold',
                            isActive ? 'bg-black text-white' : 'bg-[#28282a] text-amber-300 border border-amber-400/30',
                          )}
                          title={`${item.badge} item${item.badge === 1 ? '' : 's'} waiting for review`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>

        {/* Bottom card */}
        <div
          className="mt-8 p-4 rounded-2xl"
          style={{
            background: 'rgba(17, 17, 19, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              AI Coordinator Active
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Traces discharge directives directly to original source citations.
          </p>
        </div>
      </nav>
    </aside>
  )
}

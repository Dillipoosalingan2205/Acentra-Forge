import { NavLink } from 'react-router-dom'

import { navConfig } from '@/components/navigation/navConfig.js'
import { useApp } from '@/context/appContext.js'
import { cn } from '@/utils/classNames'

/**
 * Dark horizontal scrollable mobile navigation.
 */
export default function MobileNav() {
  const { patientId } = useApp()

  return (
    <div
      className="lg:hidden styled-scroll bg-black"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <nav aria-label="Main navigation" className="overflow-x-auto px-3 py-2.5 styled-scroll">
        <ul className="flex w-max items-center gap-1.5">
          {navConfig.map((item) => {
            const Icon = item.icon
            const to = item.to.replace(':id', patientId)

            return (
              <li key={item.to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-black' : 'text-zinc-400')} aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.badge != null && (
                        <span
                          className={cn(
                            'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold',
                            isActive ? 'bg-black text-white' : 'bg-[#28282a] text-amber-300 border border-amber-400/30',
                          )}
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
      </nav>
    </div>
  )
}

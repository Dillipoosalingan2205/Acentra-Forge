import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { navConfig } from '@/components/navigation/navConfig.js'
import { useApp } from '@/context/appContext.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useTaskContext } from '@/context/TaskContext.jsx'
import { getReviews } from '@/services/mockApi.js'
import { cn } from '@/utils/classNames'

/**
 * Dark horizontal scrollable mobile navigation.
 * Role-aware: hides "Human Review" from patients.
 */
export default function MobileNav() {
  const location = useLocation()
  const { patientId, uploadedPatientId } = useApp()
  const { user } = useAuth()
  const { tasks } = useTaskContext()
  const [openReviewCount, setOpenReviewCount] = useState(0)

  const userRole = user?.role || 'Patient'
  const isDoctor = userRole === 'Doctor'

  // Derive the active patient ID from current route if on a patient-scoped view
  const segments = location.pathname.split('/').filter(Boolean)
  const isPatientScopedRoute =
    segments.length >= 2 && !['reviews', 'processing', 'upload'].includes(segments[0])
  const routePatientId = isPatientScopedRoute ? segments[1] : null
  const effectivePatientId = routePatientId || uploadedPatientId || patientId || 'demo'

  // Filter navigation items based on role
  const filteredNav = navConfig.filter((item) => {
    if (item.label === 'Human Review' && !isDoctor) return false
    return true
  })

  useEffect(() => {
    if (!isDoctor) return

    let active = true
    const fetchOpenReviews = () => {
      getReviews()
        .then((items) => {
          if (active) {
            const count = (items || []).filter(
              (r) => !['RESOLVED', 'REJECTED'].includes((r.status || r.resolution_status || '').toUpperCase()),
            ).length
            setOpenReviewCount(count)
          }
        })
        .catch(() => {
          if (active) {
            const taskNeedsRev = (tasks || []).filter((t) => t.status === 'needs-review').length
            setOpenReviewCount(taskNeedsRev)
          }
        })
    }

    fetchOpenReviews()

    const handleSync = () => {
      fetchOpenReviews()
    }
    window.addEventListener('aegis:review-resolved', handleSync)
    window.addEventListener('focus', handleSync)

    return () => {
      active = false
      window.removeEventListener('aegis:review-resolved', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [tasks, isDoctor])

  return (
    <div
      className="lg:hidden styled-scroll bg-black"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <nav aria-label="Main navigation" className="overflow-x-auto px-3 py-2.5 styled-scroll">
        <ul className="flex w-max items-center gap-1.5">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const to = item.to.replace(':id', effectivePatientId)
            const isReviewNav = item.label === 'Human Review'
            const badge = isReviewNav
              ? (openReviewCount > 0 ? openReviewCount : null)
              : item.badge

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
                      {badge != null && (
                        <span
                          className={cn(
                            'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold',
                            isActive ? 'bg-black text-white' : 'bg-[#28282a] text-amber-300 border border-amber-400/30',
                          )}
                        >
                          {badge}
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

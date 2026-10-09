import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { navConfig } from '@/components/navigation/navConfig.js'
import { useApp } from '@/context/appContext.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useTaskContext } from '@/context/TaskContext.jsx'
import { getReviews } from '@/services/mockApi.js'
import { cn } from '@/utils/classNames'

/**
 * Minimalist dark sidebar matching the intelligence theme.
 * Role-aware: hides "Human Review" from patients, shows it for doctors.
 */
export default function Sidebar() {
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
    // Only doctors see "Human Review"
    if (item.label === 'Human Review' && !isDoctor) return false
    return true
  })

  useEffect(() => {
    if (!isDoctor) return // Patients don't need review counts

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
        {/* Role indicator */}
        <div className="px-3 pb-4 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest"
            style={{
              color: isDoctor ? '#10b981' : '#6366f1',
              background: isDoctor ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              border: `1px solid ${isDoctor ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: isDoctor ? '#10b981' : '#6366f1' }}
            />
            {isDoctor ? 'Doctor' : 'Patient'}
          </span>
        </div>

        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Care Coordination
        </p>
        <ul className="space-y-1">
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
                      {badge != null && (
                        <span
                          className={cn(
                            'ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[9px] font-bold',
                            isActive ? 'bg-black text-white' : 'bg-[#28282a] text-amber-300 border border-amber-400/30',
                          )}
                          title={`${badge} item${badge === 1 ? '' : 's'} waiting for review`}
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
            {isDoctor
              ? 'Review AI-flagged clinical cases requiring physician oversight.'
              : 'Traces discharge directives directly to original source citations.'}
          </p>
        </div>
      </nav>
    </aside>
  )
}

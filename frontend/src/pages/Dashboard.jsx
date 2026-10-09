import { useEffect, useState } from 'react'
import { AlertTriangle, CalendarClock, FileText, ListChecks, Pill, ScrollText, ShieldAlert, UploadCloud } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Card from '@/components/common/Card.jsx'
import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import LoadingState from '@/components/common/LoadingState.jsx'
import NextAction from '@/components/dashboard/NextAction.jsx'
import PatientHeader from '@/components/dashboard/PatientHeader.jsx'
import RecentActivity from '@/components/dashboard/RecentActivity.jsx'
import SummaryCard from '@/components/dashboard/SummaryCard.jsx'
import UpcomingPreview from '@/components/dashboard/UpcomingPreview.jsx'
import { useApp } from '@/context/appContext.js'
import { useTaskContext } from '@/context/TaskContext.jsx'
import { getPatientPlan } from '@/services/mockApi.js'

export default function Dashboard() {
  const { id } = useParams()
  const { patientId: appPatientId, patientName: appPatientName, updatePatient } = useApp()
  const { tasks, updateTaskStatus, activityFeed, refreshTasks } = useTaskContext()

  const [planResult, setPlanResult] = useState({ id: null, patient: null, error: null })

  useEffect(() => {
    if (!id) return

    let active = true

    // Refresh tasks for this patient immediately
    refreshTasks(id)

    getPatientPlan(id)
      .then((plan) => {
        if (active) {
          setPlanResult({ id, patient: plan.patient, error: null })
          if (plan?.patient?.name && (appPatientId !== id || appPatientName !== plan.patient.name)) {
            updatePatient(id, plan.patient.name)
          }
        }
      })
      .catch((err) =>
        active &&
        setPlanResult({
          id,
          patient: null,
          error: err.message || 'Failed to load patient info',
        }),
      )

    // Also auto-refresh when window regains focus (e.g. returning from reviews tab/page)
    const handleFocus = () => {
      refreshTasks(id)
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      active = false
      window.removeEventListener('focus', handleFocus)
    }
  }, [id, refreshTasks, updatePatient])

  const resolved = planResult.id === id ? planResult : null
  const patient = resolved?.patient ?? null
  const patientError = resolved?.error ?? null
  const patientLoading = !resolved

  if (patientError) {
    return <CarePlanNotFound section="dashboard" />
  }

  if (patientLoading || !patient) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading patient care plan…" />
      </div>
    )
  }

  // Summary counts
  const totalActions = tasks.length
  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const needsReviewCount = tasks.filter((t) => t.status === 'needs-review').length

  // Next action (earliest pending task)
  const nextAction = tasks
    .filter((t) => t.status === 'pending')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Patient Header with AI Badge & Trust Indicator */}
      <PatientHeader patient={patient} />

      {/* Summary Cards */}
      <section aria-label="Care Plan Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Actions"
            value={totalActions}
            subtitle="Extracted tasks"
          />
          <SummaryCard
            title="Pending"
            value={pendingCount}
            tone="blue"
            subtitle="Requires action"
          />
          <SummaryCard
            title="Completed"
            value={completedCount}
            tone="emerald"
            subtitle="Done by patient"
          />
          <SummaryCard
            title="Needs Review"
            value={needsReviewCount}
            tone="amber"
            subtitle="Ambiguous items"
          />
        </div>
      </section>

      {/* Review Alert Banner */}
      {needsReviewCount > 0 && (
        <section aria-label="Items Requiring Review">
          <div className="rounded-2xl p-4 bg-[#14120b] border border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    {needsReviewCount} {needsReviewCount === 1 ? 'item needs review' : 'items need review'}
                  </h3>
                  <p className="text-xs text-amber-500/90 mt-0.5">Discharge instruction requires clinician confirmation.</p>
                </div>
              </div>
              <Link
                to="/reviews"
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_18px_rgba(255,255,255,0.25)] hover:bg-[#e4e4e6] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
              >
                Review Item
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Immediate Next Action */}
      <section aria-label="Next Action">
        <NextAction
          task={nextAction}
          patientId={id}
          onComplete={updateTaskStatus}
        />
      </section>

      {/* Grid: Upcoming Preview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="Upcoming Preview">
          <UpcomingPreview tasks={tasks} patientId={id} />
        </section>

        <section aria-label="Recent Activity">
          <RecentActivity activities={activityFeed} />
        </section>
      </div>

      {/* Navigation Quick Links */}
      <section aria-label="Care Plan Navigation">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Explore Care Details</p>
          <h2 className="text-lg font-bold text-white tracking-tight">Care Plan Navigation</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: `/instructions/${id}`, icon: FileText, label: 'Instructions', sub: 'Discharge guidance' },
            { to: `/medications/${id}`, icon: Pill, label: 'Medications', sub: 'Prescriptions' },
            { to: `/warning-signs/${id}`, icon: ShieldAlert, label: 'Warning Signs', sub: 'Red flags' },
            { to: `/sources/${id}`, icon: ScrollText, label: 'Sources', sub: 'Traceability' },
            { to: `/timeline/${id}`, icon: CalendarClock, label: 'Timeline', sub: 'Follow-up dates' },
            { to: `/tasks/${id}`, icon: ListChecks, label: 'Tasks', sub: 'Action items' },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl text-center bg-[#111113] border border-white/10 transition-all duration-200 hover:-translate-y-1 hover:border-white/30 hover:bg-[#18181c]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-2.5 text-zinc-300 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-white mb-0.5 tracking-tight">{label}</span>
              <span className="text-[10px] text-zinc-500">{sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Upload new summary CTA */}
      <Link
        to="/upload"
        className="group flex items-center justify-between gap-4 rounded-2xl p-5 bg-[#111113] border border-white/10 transition-all duration-200 hover:border-white/30 hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white shrink-0 group-hover:bg-white/10 transition-colors">
            <UploadCloud className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Upload a New Discharge Summary</p>
            <p className="text-xs text-zinc-400">Analyze a different PDF and generate a fresh care plan.</p>
          </div>
        </div>
        <span className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_18px_rgba(255,255,255,0.25)] group-hover:bg-[#e4e4e6] group-hover:scale-[1.02] transition-all shrink-0">
          Upload →
        </span>
      </Link>
    </div>
  )
}
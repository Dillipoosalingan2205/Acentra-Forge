import { useState } from 'react'
import { Filter, ListChecks } from 'lucide-react'
import { useParams } from 'react-router-dom'

import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import LoadingState from '@/components/common/LoadingState.jsx'
import { TaskCard } from '@/components/tasks/TaskCard.jsx'
import { useTaskContext } from '@/context/TaskContext.jsx'
import { useCarePlanGuard } from '@/hooks/useCarePlanGuard.js'
import { cn } from '@/utils/classNames'

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: 'all' },
  { label: 'Appointments', value: 'appointment' },
  { label: 'Investigations', value: 'investigation' },
  { label: 'Referrals', value: 'referral' },
  { label: 'Care Instructions', value: 'care-instruction' },
  { label: 'Medication', value: 'medication' },
  { label: 'Follow-up', value: 'follow-up' },
]

export default function Tasks() {
  const { id } = useParams()
  const { tasks, loading } = useTaskContext()
  const guard = useCarePlanGuard(id)

  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Filter tasks based on both status and category
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false
    }
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false
    }
    return true
  })

  // Summary counts
  const totalCount = tasks.length
  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const needsReviewCount = tasks.filter((t) => t.status === 'needs-review').length

  const summaryMetrics = [
    {
      label: 'Total',
      count: totalCount,
      valueClass: 'text-white',
      borderClass: 'border-white/[0.08]',
      bgClass: 'bg-slate-900/60',
    },
    {
      label: 'Pending',
      count: pendingCount,
      valueClass: 'text-blue-400',
      borderClass: 'border-blue-500/30',
      bgClass: 'bg-blue-950/20',
    },
    {
      label: 'Completed',
      count: completedCount,
      valueClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30',
      bgClass: 'bg-emerald-950/20',
    },
    {
      label: 'Needs Review',
      count: needsReviewCount,
      valueClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
      bgClass: 'bg-amber-950/20',
    },
  ]

  if (guard === 'missing') {
    return <CarePlanNotFound section="tasks" />
  }

  if (guard === 'checking' || loading) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading follow-up tasks…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      {/* Header */}
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
            <ListChecks className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Care Action Items
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Follow-up Tasks
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Track, filter, and complete clinical actions extracted from your discharge summary.
        </p>
      </header>

      {/* Summary Metrics Cards */}
      <section aria-label="Task Summary" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {summaryMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-white/10 bg-[#111113] p-4 sm:p-5 text-center transition-all duration-200 hover:border-white/20"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {metric.label}
            </p>
            <p
              className={cn('mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight', metric.valueClass)}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {metric.count}
            </p>
          </div>
        ))}
      </section>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#111113] p-3 sm:p-4 shadow-lg">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'needs-review', label: 'Needs Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
                statusFilter === tab.id
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'bg-[#28282a] text-zinc-400 hover:text-white border border-white/10',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <label htmlFor="categoryFilter" className="sr-only">
            Filter by Category
          </label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-full border border-white/10 bg-[#28282a] px-3.5 py-1.5 text-xs font-medium text-zinc-200 shadow-xs transition-colors focus:border-white/40 focus:outline-none cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-black text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <section aria-label="Tasks List">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-12 text-center">
            <ListChecks className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No tasks match your current filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the status or category filter.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                taskId={task.id}
                showActions={true}
                link={task.id === 'TASK-005' ? `/medications/${id}` : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
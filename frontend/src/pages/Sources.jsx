import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, CheckCircle2, ShieldCheck, Filter, Bookmark } from 'lucide-react'

import { getSources, getPatient } from '@/services/mockApi.js'
import LoadingState from '@/components/common/LoadingState.jsx'
import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import { cn } from '@/utils/classNames'

export default function Sources() {
  const { id } = useParams()
  const [sources, setSources] = useState([])
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    let active = true

    Promise.all([getSources(id), getPatient(id)])
      .then(([sourceData, patientData]) => {
        if (active) {
          setSources(sourceData)
          setPatient(patientData)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load source traceability data')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return <CarePlanNotFound section="sources" />
  }

  if (loading || !sources.length) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading document source citations…" />
      </div>
    )
  }

  const documentName = patient?.documentName || 'John_Doe_Discharge.pdf'

  const categories = [
    { id: 'all', label: 'All Sources' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'medications', label: 'Medications' },
    { id: 'warning-signs', label: 'Warning Signs' },
  ]

  const filteredSources =
    categoryFilter === 'all'
      ? sources
      : sources.filter((s) => s.category === categoryFilter)

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      {/* Page Header */}
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
            <Bookmark className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Audit Trail & Verifiability
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Sources & Traceability
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Complete provenance mapping linking every extracted action and instruction back to the original discharge document.
        </p>
      </header>

      {/* Primary Source Document Card */}
      <div className="rounded-2xl border border-white/10 bg-[#111113] p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white shadow-md">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Primary Source Document
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified PDF
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {documentName}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                Discharge summary for <strong className="text-white">{patient?.name || 'John Doe'}</strong> · Discharged on {patient?.dischargeDate || '2026-10-08'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-full bg-black border border-white/10 px-4 py-2 text-xs text-zinc-300 sm:self-center">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Verifiable citations across Pages 2–5. No synthetic pages.</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs for tasks, instructions, medications, warning signs */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0 mr-1" aria-hidden="true" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
                categoryFilter === cat.id
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'bg-[#28282a] text-zinc-400 hover:text-white border border-white/10',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-400 whitespace-nowrap">
          Showing <strong className="text-white">{filteredSources.length}</strong> of {sources.length} citations
        </span>
      </div>

      {/* Source Citation List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="rounded-2xl border border-white/10 bg-[#111113] p-5 shadow-xs transition-all duration-200 hover:border-white/20"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-sm sm:text-base text-white">{source.item}</span>
                <span className="rounded-full bg-[#28282a] border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 capitalize">
                  {source.categoryLabel || source.category}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <FileText className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                <span>
                  {source.documentName || documentName} · Page {source.page}
                  {source.section ? ` (${source.section})` : ''}
                </span>
              </div>
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Exact Excerpt in Source:
            </div>
            <div className="rounded-xl bg-black border border-white/10 p-3 text-xs sm:text-sm font-mono text-zinc-200 break-words leading-relaxed">
              &ldquo;{source.originalText}&rdquo;
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
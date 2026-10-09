import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AlertCircle, Pill } from 'lucide-react'

import { getMedications } from '@/services/mockApi.js'
import LoadingState from '@/components/common/LoadingState.jsx'
import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import { InstructionCard } from '@/components/instructions/InstructionCard.jsx'

export default function Medications() {
  const { id } = useParams()
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const fetchMedications = async () => {
      try {
        await new Promise((res) => setTimeout(res, 250))
        const data = await getMedications(id)
        if (active) {
          setMedications(data)
          setLoading(false)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load medications')
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchMedications()
    }

    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return <CarePlanNotFound section="medications" />
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading medication instructions…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      {/* Header */}
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
            <Pill className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Pharmaceutical Directives
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Medication Instructions
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Medication-related instructions extracted from your discharge summary.
        </p>
      </header>

      {/* Safety Notice Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#111113] p-4 text-xs text-zinc-300 flex items-start gap-3.5 shadow-lg">
        <AlertCircle className="h-4 w-4 text-zinc-300 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-white font-semibold">Important Safety Notice:</strong> This system only reflects verbatim text extracted
          from your discharge documentation. It never alters medications, infers dosages, evaluates medication safety,
          or resolves ambiguities. Always confirm any unclear instructions directly with your healthcare provider.
        </p>
      </div>

      {/* Medication Instruction Cards */}
      {!medications.length ? (
        <EmptyState
          title="No explicit medication directives extracted."
          description="Medication changes or instructions were not identified in this discharge record."
          icon={Pill}
        />
      ) : (
        <div className="space-y-4">
          {medications.map((med) => (
            <InstructionCard key={med.id} instruction={med} />
          ))}
        </div>
      )}
    </div>
  )
}
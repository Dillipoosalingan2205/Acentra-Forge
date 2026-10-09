import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

import { getWarningSigns } from '@/services/mockApi.js'
import LoadingState from '@/components/common/LoadingState.jsx'
import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import { InstructionCard } from '@/components/instructions/InstructionCard.jsx'

export default function WarningSigns() {
  const { id } = useParams()
  const [warningSigns, setWarningSigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const fetchWarningSigns = async () => {
      try {
        await new Promise((res) => setTimeout(res, 350)) // simulate latency
        const data = await getWarningSigns(id)
        if (active) {
          setWarningSigns(data)
          setLoading(false)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load warning signs')
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchWarningSigns()
    }

    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return <CarePlanNotFound section="warning-signs" />
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading warning signs…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      {/* Header */}
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Critical Alerts & Escalations
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Warning Signs
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Symptoms and physical indicators that require immediate medical attention.
        </p>
      </header>

      {/* Warning Signs List */}
      {!warningSigns.length ? (
        <EmptyState
          title="No warning signs were explicitly identified in this discharge summary."
          description="This does not mean there are no risks; always consult your care team if you have questions or concerns."
          icon={AlertTriangle}
        />
      ) : (
        <div className="space-y-4">
          {warningSigns.map((ws) => (
            <InstructionCard key={ws.id} instruction={ws} />
          ))}
        </div>
      )}
    </div>
  )
}
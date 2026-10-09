import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

import { getInstructions } from '@/services/mockApi.js'
import LoadingState from '@/components/common/LoadingState.jsx'
import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import { InstructionCard } from '@/components/instructions/InstructionCard.jsx'

export default function Instructions() {
  const { id } = useParams()
  const [instructions, setInstructions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const fetchInstructions = async () => {
      try {
        await new Promise((res) => setTimeout(res, 350)) // simulate latency
        const data = await getInstructions(id)
        if (active) {
          setInstructions(data)
          setLoading(false)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load instructions')
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchInstructions()
    }

    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return <CarePlanNotFound section="instructions" />
  }

  if (loading || !instructions.length) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <LoadingState label="Loading discharge instructions…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-6 space-y-6">
      {/* Header */}
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Extracted Clinical Guidance
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Discharge Instructions
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          AI-extracted guidance from your discharge summary, with confidence scores and source citations.
        </p>
      </header>

      {/* Instructions list */}
      <div className="space-y-4">
        {instructions.map((instruction) => (
          <InstructionCard key={instruction.id} instruction={instruction} />
        ))}
      </div>
    </div>
  )
}
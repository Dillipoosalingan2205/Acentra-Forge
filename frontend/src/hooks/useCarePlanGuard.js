import { useEffect, useState } from 'react'

import { getDocument, getPatient } from '@/services/mockApi.js'

/**
 * Resolves a route id against the demo data layer.
 *
 * Pages that render data from TaskContext (scoped to the session patient
 * rather than the URL) would otherwise silently show the session patient's
 * plan for any id in the URL. Guarding on the route id keeps unknown ids
 * consistent with every other care-plan page (docs/ROUTES.md, "deep-link
 * safety").
 *
 * The result is tagged with the id it describes so a change of route id
 * derives back to 'checking' during render instead of via a state reset.
 */
function useResolvedId(fetcher, id) {
  const [result, setResult] = useState({ id: null, status: 'checking', data: null })

  useEffect(() => {
    if (!id) return

    let active = true

    fetcher(id)
      .then((data) => active && setResult({ id, status: 'ok', data }))
      .catch(() => active && setResult({ id, status: 'missing', data: null }))

    return () => {
      active = false
    }
  }, [fetcher, id])

  if (!id) return { status: 'missing', data: null }
  return result.id === id ? result : { status: 'checking', data: null }
}

/** Guards a patient route id (`/dashboard/:id`, `/timeline/:id`, …). */
export function useCarePlanGuard(id) {
  return useResolvedId(getPatient, id).status
}

/** Guards a document route id (`/processing/:id`) and exposes its patient. */
export function useDocumentGuard(id) {
  return useResolvedId(getDocument, id)
}

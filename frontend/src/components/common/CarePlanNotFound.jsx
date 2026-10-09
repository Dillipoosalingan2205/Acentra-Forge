import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

import EmptyState from '@/components/common/EmptyState.jsx'
import { getButtonClasses } from '@/components/common/buttonStyles.js'

/**
 * Shown when a care-plan route is loaded with a patient id the demo
 * data layer doesn't know. Keeps every page's 404 messaging identical.
 */
export default function CarePlanNotFound({ section, title, description }) {
  return (
    <div className="mx-auto max-w-5xl">
      <EmptyState
        icon={SearchX}
        title={title || "We couldn't find this care plan."}
        description={
          description ||
          (section
            ? `The patient id provided isn't available in the demo. Try /${section}/demo.`
            : "The patient id provided isn't available in the demo.")
        }
        action={
          <Link to="/dashboard/demo" className={getButtonClasses({ size: 'sm' })}>
            Return to Dashboard
          </Link>
        }
      />
    </div>
  )
}

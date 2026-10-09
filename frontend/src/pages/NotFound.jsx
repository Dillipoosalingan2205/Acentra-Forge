import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

import Card from '@/components/common/Card.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import { getButtonClasses } from '@/components/common/buttonStyles.js'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <EmptyState
          icon={SearchX}
          title="We couldn't find this care plan."
          description="The page or patient id you're looking for doesn't exist in this demo. Head back to the dashboard to continue."
          action={
            <Link to="/dashboard/demo" className={getButtonClasses({ size: 'sm' })}>
              Return to Dashboard
            </Link>
          }
        />
      </Card>
    </div>
  )
}

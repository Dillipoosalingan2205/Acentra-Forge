import { Clock } from 'lucide-react'

import Card from '@/components/common/Card.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'

/**
 * Standard "arriving later" page, rendered inside the AppShell.
 * Keeps Phase 1 placeholders polished and consistent while the
 * team builds real screens in Phases 2–6.
 */
export default function PagePlaceholder({ title, phase = 2, icon: Icon = Clock, description }) {
  return (
    <Card>
      <EmptyState
        icon={Icon}
        title={`${title} functionality will be implemented in Phase ${phase}.`}
        description={description}
      />
    </Card>
  )
}

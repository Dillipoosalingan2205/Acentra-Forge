import {
  CalendarClock,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  ListChecks,
  Pill,
  ScrollText,
  ShieldAlert,
  Stethoscope,
  UploadCloud,
} from 'lucide-react'

/**
 * Single source of truth for sidebar navigation.
 *
 * - `to` uses the route template (with `:id`). The Sidebar resolves `:id`
 *   against the current patient id from AppContext.
 * - `badge` is driven from config — never hardcoded in the component — so
 *   later phases can compute the count from mockApi.getReviews().
 */
export const navConfig = [
  { label: 'Upload Summary', to: '/upload', icon: UploadCloud },
  { label: 'Overview', to: '/dashboard/:id', icon: LayoutDashboard },
  { label: 'Timeline', to: '/timeline/:id', icon: CalendarClock },
  { label: 'Tasks', to: '/tasks/:id', icon: ListChecks },
  { label: 'Instructions', to: '/instructions/:id', icon: FileText },
  { label: 'Medications', to: '/medications/:id', icon: Pill },
  { label: 'Warning Signs', to: '/warning-signs/:id', icon: ShieldAlert },
  { label: 'Sources', to: '/sources/:id', icon: ScrollText },
  { label: 'Providers', to: '/providers/:id', icon: Stethoscope },
  { label: 'Human Review', to: '/reviews', icon: ClipboardCheck, badge: 1 },
]

import { Outlet } from 'react-router-dom'

import MobileNav from '@/components/layout/MobileNav.jsx'
import Navbar from '@/components/layout/Navbar.jsx'
import Sidebar from '@/components/layout/Sidebar.jsx'

/**
 * Single-theme application shell matching the deep black aesthetic.
 */
export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />
      <MobileNav />
      <div className="flex flex-1 items-stretch">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
          <footer
            className="mt-12 pt-6 text-center text-xs leading-relaxed text-slate-500"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            Intelligence Designed To Evolve · Organized for post-discharge tracking, not clinical diagnosis.
          </footer>
        </main>
      </div>
    </div>
  )
}

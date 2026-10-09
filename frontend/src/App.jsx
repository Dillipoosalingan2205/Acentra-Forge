import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx'
import AppShell from '@/components/layout/AppShell.jsx'
import Dashboard from '@/pages/Dashboard.jsx'
import ForgotPassword from '@/pages/ForgotPassword.jsx'
import Home from '@/pages/Home.jsx'
import Instructions from '@/pages/Instructions.jsx'
import Login from '@/pages/Login.jsx'
import Medications from '@/pages/Medications.jsx'
import NotFound from '@/pages/NotFound.jsx'
import Processing from '@/pages/Processing.jsx'
import Providers from '@/pages/Providers.jsx'
import ResetPassword from '@/pages/ResetPassword.jsx'
import ReviewCase from '@/pages/ReviewCase.jsx'
import ReviewQueue from '@/pages/ReviewQueue.jsx'
import Signup from '@/pages/Signup.jsx'
import Sources from '@/pages/Sources.jsx'
import Tasks from '@/pages/Tasks.jsx'
import Timeline from '@/pages/Timeline.jsx'
import Upload from '@/pages/Upload.jsx'
import WarningSigns from '@/pages/WarningSigns.jsx'

/** Reset scroll to the top on every navigation. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public marketing landing page */}
        <Route path="/" element={<Home />} />

        {/* Public authentication flows */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<Navigate to="/dashboard/demo" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* All internal application routes require authentication and render inside AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/upload" element={<Upload />} />
          <Route path="/processing/:id" element={<Processing />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/timeline/:id" element={<Timeline />} />
          <Route path="/tasks/:id" element={<Tasks />} />
          <Route path="/instructions/:id" element={<Instructions />} />
          <Route path="/medications/:id" element={<Medications />} />
          <Route path="/warning-signs/:id" element={<WarningSigns />} />
          <Route path="/sources/:id" element={<Sources />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/providers/:id" element={<Providers />} />
          <Route path="/reviews" element={<ReviewQueue />} />
          <Route path="/reviews/:id" element={<ReviewCase />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Root aliases */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/demo" replace />} />
        <Route path="/timeline" element={<Navigate to="/timeline/demo" replace />} />
        <Route path="/tasks" element={<Navigate to="/tasks/demo" replace />} />
        <Route path="/instructions" element={<Navigate to="/instructions/demo" replace />} />
        <Route path="/medications" element={<Navigate to="/medications/demo" replace />} />
        <Route path="/warning-signs" element={<Navigate to="/warning-signs/demo" replace />} />
        <Route path="/sources" element={<Navigate to="/sources/demo" replace />} />
        <Route path="/providers" element={<Navigate to="/providers/demo" replace />} />
        <Route path="/processing" element={<Navigate to="/processing/demo" replace />} />
      </Routes>
    </>
  )
}

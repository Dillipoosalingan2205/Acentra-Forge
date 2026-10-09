import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import ProtectedRoute from '@/components/auth/ProtectedRoute.jsx'
import AppShell from '@/components/layout/AppShell.jsx'
import { useApp } from '@/context/appContext.js'
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
import RoleSelect from '@/pages/RoleSelect.jsx'
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

function PatientRedirect({ toPrefix }) {
  const { uploadedPatientId, patientId } = useApp()
  const targetId = uploadedPatientId || patientId || 'demo'
  return <Navigate to={`${toPrefix}/${targetId}`} replace />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public marketing landing page */}
        <Route path="/" element={<Home />} />

        {/* Role selection portal */}
        <Route path="/role-select" element={<RoleSelect />} />

        {/* Public authentication flows — role-parameterized login */}
        <Route path="/login" element={<Navigate to="/role-select" replace />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<Navigate to="/dashboard/demo" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Patient routes — all internal application routes inside AppShell */}
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
          {/* Human Review — accessible by both Doctors and Patients in the shell, but Doctor-gated at component level */}
          <Route path="/reviews" element={<ReviewQueue />} />
          <Route path="/reviews/:id" element={<ReviewCase />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Root aliases dynamically routed to active session patient */}
        <Route path="/dashboard" element={<PatientRedirect toPrefix="/dashboard" />} />
        <Route path="/timeline" element={<PatientRedirect toPrefix="/timeline" />} />
        <Route path="/tasks" element={<PatientRedirect toPrefix="/tasks" />} />
        <Route path="/instructions" element={<PatientRedirect toPrefix="/instructions" />} />
        <Route path="/medications" element={<PatientRedirect toPrefix="/medications" />} />
        <Route path="/warning-signs" element={<PatientRedirect toPrefix="/warning-signs" />} />
        <Route path="/sources" element={<PatientRedirect toPrefix="/sources" />} />
        <Route path="/providers" element={<PatientRedirect toPrefix="/providers" />} />
        <Route path="/processing" element={<Navigate to="/upload" replace />} />
      </Routes>
    </>
  )
}

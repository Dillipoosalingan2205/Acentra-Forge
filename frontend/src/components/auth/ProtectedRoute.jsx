import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.js'

/**
 * ProtectedRoute with optional role-based access control.
 *
 * Props:
 *  - allowedRoles: Array of roles that can access this route (e.g. ['Doctor']).
 *                  If omitted, any authenticated user is allowed.
 *  - children:     Optional children to render instead of <Outlet />.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Checking authorization...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve requested location for redirect after login
    return <Navigate to="/role-select" state={{ from: location }} replace />
  }

  // Role-based access check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'Patient'
    if (!allowedRoles.includes(userRole)) {
      // Redirect to their appropriate home page
      if (userRole === 'Doctor') {
        return <Navigate to="/reviews" replace />
      }
      return <Navigate to="/dashboard/demo" replace />
    }
  }

  return children ? children : <Outlet />
}

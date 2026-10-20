import { Navigate, Outlet, useLocation } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/admin/AuthProvider'

/**
 * Route guard for everything behind the login. Shows a spinner while the first session check runs,
 * and sends signed-out visitors to /login?next=<the page they asked for> (plus ?expired=1 when a session ended).
 * roles — optional list; people with another role see the "no permission" page.
 */
export default function RequireAuth({ roles }) {
  const { status, admin, expired, signedOut } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-primary-600">
        <Spinner size="lg" label="Checking your session" />
      </div>
    )
  }

  if (status === 'anon') {
    if (signedOut) return <Navigate to="/login" replace />
    const next = location.pathname + location.search
    const params = new URLSearchParams()
    if (next !== '/') params.set('next', next)
    if (expired) params.set('expired', '1')
    const query = params.toString()
    return <Navigate to={`/login${query ? `?${query}` : ''}`} replace />
  }

  if (roles && !roles.includes(admin.role)) return <Navigate to="/forbidden" replace />

  return <Outlet />
}

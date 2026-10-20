import { Outlet } from 'react-router'
import { AuthProvider } from '@/admin/AuthProvider'

// One session context for the whole app; every route sits inside it.
export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

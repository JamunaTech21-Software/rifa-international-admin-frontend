import { Outlet } from 'react-router'
import { ToastProvider } from '@/components/ui/Toaster'
import { AuthProvider } from '@/admin/AuthProvider'

// One session context for the whole app; every route sits inside it.
export default function Root() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ToastProvider>
  )
}

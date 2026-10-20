import { Outlet } from 'react-router'
import Logo from '@/components/ui/Logo'

/** Centered card on a soft background for the login, forgot-password and reset-password screens. */
export default function AuthLayout() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-surface-2 to-white px-4 py-10">
      <Logo className="mb-6 h-14" />
      <div className="w-full max-w-md rounded-card border border-line bg-white p-6 shadow-card-hover sm:p-8">
        <Outlet />
      </div>
      <p className="mt-6 text-xs text-muted">Rifa International (RL-693) · Admin panel</p>
    </main>
  )
}

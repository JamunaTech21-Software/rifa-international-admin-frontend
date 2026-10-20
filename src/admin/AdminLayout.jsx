import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LogOut, Menu, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/admin/AuthProvider'
import SidebarNav from '@/admin/SidebarNav'
import useUnreadMessages from '@/admin/useUnreadMessages'
import { roleLabels } from '@/admin/navItems'

/**
 * The admin frame: navy sidebar on large screens (a slide-in drawer on small ones) and a top bar with
 * the admin's name and Logout. Page content renders in <Outlet/>. Pages use dense 14px text.
 */
export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const { pathname } = useLocation()
  const unread = useUnreadMessages(pathname)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const drawerRef = useRef(null)

  // The drawer is a modal <dialog>: focus stays inside it and Esc closes it.
  useEffect(() => {
    const dialog = drawerRef.current
    if (!dialog) return
    if (drawerOpen && !dialog.open) dialog.showModal()
    if (!drawerOpen && dialog.open) dialog.close()
  }, [drawerOpen])

  const handleLogout = async () => {
    setSigningOut(true)
    await logout()
  }

  return (
    <div className="min-h-screen bg-surface text-sm text-body">
      <a
        href="#admin-main"
        className="sr-only z-50 rounded-btn bg-primary-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy-900 px-4 py-5 lg:flex">
        <div className="mb-6 px-2">
          <Logo variant="white" className="h-11 sm:h-11" />
          <p className="mt-2 text-xs font-semibold tracking-widest text-white/60 uppercase">Admin panel</p>
        </div>
        <SidebarNav role={admin.role} unread={unread} />
      </aside>

      {/* Mobile drawer */}
      <dialog
        ref={drawerRef}
        aria-label="Menu"
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => event.target === drawerRef.current && setDrawerOpen(false)}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(18rem,86vw)] max-w-none bg-navy-900 p-0 text-white backdrop:bg-navy-950/60"
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="mb-6 flex items-start justify-between px-2">
            <div>
              <Logo variant="white" className="h-10" />
              <p className="mt-2 text-xs font-semibold tracking-widest text-white/60 uppercase">
                Admin panel
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-btn text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <SidebarNav role={admin.role} unread={unread} onNavigate={() => setDrawerOpen(false)} />
        </div>
      </dialog>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-btn text-ink hover:bg-primary-50 lg:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-ink">{admin.name}</p>
              <p className="text-xs text-muted">{roleLabels[admin.role] ?? admin.role}</p>
            </div>
            <Button variant="outline" size="sm" iconLeft={LogOut} loading={signingOut} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main id="admin-main" tabIndex={-1} className="px-4 py-6 focus-visible:ring-0 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

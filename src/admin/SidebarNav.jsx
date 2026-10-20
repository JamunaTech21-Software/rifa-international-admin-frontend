import { NavLink } from 'react-router'
import { cn } from '@/lib/cn'
import { navItems } from '@/admin/navItems'

/** The sidebar link list. Used in the fixed desktop sidebar and inside the mobile drawer. */
export default function SidebarNav({ role, unread, onNavigate }) {
  return (
    <nav aria-label="Admin">
      <ul className="space-y-1">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge === 'messages' && unread > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-danger-600 px-1.5 text-xs font-bold text-white">
                      {unread > 99 ? '99+' : unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}

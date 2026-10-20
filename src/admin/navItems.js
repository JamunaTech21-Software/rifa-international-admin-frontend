import {
  BriefcaseBusiness,
  Inbox,
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'

/** Sidebar links. `roles` limits who sees an item; `badge: 'messages'` shows the unread count. */
export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Applications', icon: Users },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/messages', label: 'Messages', icon: Inbox, badge: 'messages' },
  { to: '/users', label: 'Users', icon: ShieldCheck, roles: ['super_admin'] },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export const roleLabels = { super_admin: 'Super admin', staff: 'Staff' }

import { createBrowserRouter } from 'react-router'
import AdminLayout from '@/admin/AdminLayout'
import RequireAuth from '@/admin/RequireAuth'
import Root from '@/admin/Root'
import AuthLayout from '@/pages/AuthLayout'
import ApplicationsPage from '@/pages/ApplicationsPage'
import DashboardPage from '@/pages/DashboardPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import LoginPage from '@/pages/LoginPage'
import { ApplicationDetailPlaceholder, MessageDetailPlaceholder } from '@/pages/MessagePages'
import PlaceholderPage from '@/pages/PlaceholderPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import { ErrorPage, ForbiddenPage, NotFoundPage } from '@/pages/StatusPages'

/*
 * Routes (the backend's emails link to /applications/:id, /messages/:id and /reset-password?token=…):
 *   /login  /forgot-password  /reset-password      public
 *   /  /applications  /applications/:id  /messages  /messages/:id  /profile      signed in
 *   /users                                                                      super admin only
 */
const router = createBrowserRouter([
  {
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      {
        Component: AuthLayout,
        children: [
          { path: 'login', Component: LoginPage },
          { path: 'forgot-password', Component: ForgotPasswordPage },
          { path: 'reset-password', Component: ResetPasswordPage },
        ],
      },
      {
        Component: RequireAuth,
        children: [
          {
            Component: AdminLayout,
            children: [
              { index: true, Component: DashboardPage },
              { path: 'applications', Component: ApplicationsPage },
              { path: 'applications/:id', Component: ApplicationDetailPlaceholder },
              { path: 'messages', element: <PlaceholderPage title="Messages" story="AD-05" /> },
              { path: 'messages/:id', Component: MessageDetailPlaceholder },
              { path: 'profile', element: <PlaceholderPage title="Profile" story="AD-05" /> },
              { path: 'forbidden', Component: ForbiddenPage },
              { path: '*', Component: NotFoundPage },
            ],
          },
        ],
      },
      {
        element: <RequireAuth roles={['super_admin']} />,
        children: [
          {
            Component: AdminLayout,
            children: [{ path: 'users', element: <PlaceholderPage title="Users" story="AD-05" /> }],
          },
        ],
      },
    ],
  },
])

export default router

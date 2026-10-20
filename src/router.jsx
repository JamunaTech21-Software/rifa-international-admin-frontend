import { createBrowserRouter } from 'react-router'
import AdminLayout from '@/admin/AdminLayout'
import RequireAuth from '@/admin/RequireAuth'
import Root from '@/admin/Root'
import AuthLayout from '@/pages/AuthLayout'
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import DashboardPage from '@/pages/DashboardPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import JobFormPage from '@/pages/JobFormPage'
import JobsPage from '@/pages/JobsPage'
import LoginPage from '@/pages/LoginPage'
import MessageDetailPage from '@/pages/MessageDetailPage'
import MessagesPage from '@/pages/MessagesPage'
import NewsFormPage from '@/pages/NewsFormPage'
import NewsListPage from '@/pages/NewsListPage'
import ProfilePage from '@/pages/ProfilePage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import UsersPage from '@/pages/UsersPage'
import { ErrorPage, ForbiddenPage, NotFoundPage } from '@/pages/StatusPages'

/*
 * Routes (the backend's emails link to /applications/:id, /messages/:id and /reset-password?token=…):
 *   /login  /forgot-password  /reset-password      public
 *   /  /applications  /applications/:id  /jobs  /jobs/new  /jobs/:id  /news  /news/new  /news/:id  /messages  /messages/:id  /profile      signed in
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
              { path: 'applications/:id', Component: ApplicationDetailPage },
              { path: 'jobs', Component: JobsPage },
              { path: 'jobs/new', Component: JobFormPage },
              { path: 'jobs/:id', Component: JobFormPage },
              { path: 'news', Component: NewsListPage },
              { path: 'news/new', Component: NewsFormPage },
              { path: 'news/:id', Component: NewsFormPage },
              { path: 'messages', Component: MessagesPage },
              { path: 'messages/:id', Component: MessageDetailPage },
              { path: 'profile', Component: ProfilePage },
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
            children: [{ path: 'users', Component: UsersPage }],
          },
        ],
      },
    ],
  },
])

export default router

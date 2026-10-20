import { Link, useRouteError } from 'react-router'
import { Ban, SearchX, TriangleAlert } from 'lucide-react'
import Button from '@/components/ui/Button'

function Box({ icon: Icon, tone, title, children }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <span className={`inline-flex size-14 items-center justify-center rounded-full ${tone}`}>
        <Icon size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl">{title}</h1>
      <div className="mt-2 max-w-md text-body">{children}</div>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <Box icon={SearchX} tone="bg-primary-50 text-primary-600" title="Page not found">
      <p>The page you are looking for does not exist.</p>
      <Button to="/" className="mt-5">
        Go to Dashboard
      </Button>
    </Box>
  )
}

export function ForbiddenPage() {
  return (
    <Box icon={Ban} tone="bg-danger-50 text-danger-600" title="No permission">
      <p>Your account does not have access to this page. Ask a super admin if you need it.</p>
      <Button to="/" className="mt-5">
        Go to Dashboard
      </Button>
    </Box>
  )
}

export function ErrorPage() {
  const error = useRouteError()
  if (import.meta.env.DEV && error) console.error(error)
  return (
    <Box icon={TriangleAlert} tone="bg-warning-50 text-warning-500" title="Something went wrong">
      <p>The page could not be shown. Please reload, or go back to the dashboard.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
        <Link to="/" className="inline-flex h-12 items-center rounded-sm px-2 font-semibold text-primary-600">
          Dashboard
        </Link>
      </div>
    </Box>
  )
}

import { Link } from 'react-router'
import { CalendarDays, CalendarRange, Inbox, RotateCw, Users } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/format'
import { statusStyle } from '@/lib/statuses'
import useApiQuery from '@/lib/useApiQuery'
import { cn } from '@/lib/cn'

const number = new Intl.NumberFormat('en-US')

function StatCard({ icon: Icon, label, value, note, tone, to }) {
  const body = (
    <div className="flex items-center gap-4 rounded-card border border-line bg-white p-4 shadow-card transition-shadow group-hover:shadow-card-hover">
      <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-full', tone)}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-body">{label}</p>
        <p className="text-2xl leading-tight font-bold text-ink">{number.format(value)}</p>
        {note && <p className="text-xs text-muted">{note}</p>}
      </div>
    </div>
  )
  return to ? (
    <Link to={to} className="group block rounded-card">
      {body}
    </Link>
  ) : (
    body
  )
}

function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-card bg-line', className)} />
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading the dashboard" className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[5.5rem]" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

// Rows with a label, a bar proportional to the largest count, and the count.
function BarList({ rows, emptyText }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  if (rows.length === 0) return <p className="text-muted">{emptyText}</p>
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-ink">{row.label}</span>
            <span className="font-semibold text-ink tabular-nums">{number.format(row.count)}</span>
          </div>
          <div
            role="img"
            aria-label={`${row.label}: ${row.count}`}
            className="h-2.5 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className={cn('h-full rounded-full', row.barClass)}
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Empty({ children }) {
  return <p className="py-6 text-center text-muted">{children}</p>
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useApiQuery('/admin/dashboard')

  return (
    <>
      <title>Dashboard | Rifa International Admin</title>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Dashboard</h1>
        {data && (
          <Button variant="outline" size="sm" iconLeft={RotateCw} onClick={reload}>
            Refresh
          </Button>
        )}
      </div>

      {loading && !data && <DashboardSkeleton />}

      {error && !loading && (
        <Alert variant="error" title="The dashboard could not be loaded">
          <p>{error.status === 0 ? 'Could not reach the server.' : error.message}</p>
          <Button size="sm" iconLeft={RotateCw} onClick={reload} className="mt-3">
            Try again
          </Button>
        </Alert>
      )}

      {data && (
        <div className={cn('space-y-5', loading && 'opacity-60')} aria-busy={loading}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={CalendarDays}
              label="Applications today"
              value={data.applications.today}
              tone="bg-tone-blue-50 text-tone-blue"
              to="/applications"
            />
            <StatCard
              icon={CalendarRange}
              label="Applications this week"
              value={data.applications.this_week}
              note="Week starts on Sunday"
              tone="bg-tone-purple-50 text-tone-purple"
              to="/applications"
            />
            <StatCard
              icon={Users}
              label="Total applications"
              value={data.applications.total}
              tone="bg-tone-green-50 text-tone-green"
              to="/applications"
            />
            <StatCard
              icon={Inbox}
              label="Unread messages"
              value={data.messages.unread}
              note={`${number.format(data.messages.open)} open in total`}
              tone="bg-tone-orange-50 text-tone-orange"
              to="/messages"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="Applications by status" action={{ to: '/applications', label: 'View all' }}>
              <BarList
                emptyText="No applications yet."
                rows={data.by_status.map((row) => ({
                  key: row.status,
                  label: row.label,
                  count: row.count,
                  barClass: statusStyle(row.status).bar,
                }))}
              />
            </Panel>
            <Panel title="Applications by job category">
              <BarList
                emptyText="No categories yet."
                rows={data.by_category.map((row) => ({
                  key: row.slug,
                  label: row.name,
                  count: row.count,
                  barClass: 'bg-primary-500',
                }))}
              />
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel
              title="Latest applications"
              action={{ to: '/applications', label: 'View all' }}
              bodyClassName="p-0"
            >
              {data.latest_applications.length === 0 ? (
                <Empty>No applications yet.</Empty>
              ) : (
                <ul className="divide-y divide-line">
                  {data.latest_applications.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/applications/${item.id}`}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface"
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink">{item.full_name}</span>
                          <span className="block text-xs text-muted">
                            {item.reference_no} · {item.category_name}
                          </span>
                        </span>
                        <span className="flex flex-col items-end gap-1">
                          <StatusBadge status={item.status} label={item.status_label} />
                          <span className="text-xs text-muted">{formatDateTime(item.created_at)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Latest messages"
              action={{ to: '/messages', label: 'View all' }}
              bodyClassName="p-0"
            >
              {data.latest_messages.length === 0 ? (
                <Empty>No messages yet.</Empty>
              ) : (
                <ul className="divide-y divide-line">
                  {data.latest_messages.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/messages/${item.id}`}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            {item.status === 'new' && (
                              <span
                                className="size-2 shrink-0 rounded-full bg-primary-600"
                                aria-hidden="true"
                              />
                            )}
                            <span
                              className={cn(
                                'text-ink',
                                item.status === 'new' ? 'font-bold' : 'font-semibold',
                              )}
                            >
                              {item.full_name}
                            </span>
                            {item.status === 'new' && <span className="sr-only">(unread)</span>}
                          </span>
                          <span className="block text-xs text-muted">{item.subject_label}</span>
                        </span>
                        <span className="text-xs text-muted">{formatDateTime(item.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  )
}

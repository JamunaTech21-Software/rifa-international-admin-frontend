import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BriefcaseBusiness, Plus, RotateCw } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import JobPhoto from '@/components/ui/JobPhoto'
import { useToast } from '@/components/ui/Toaster'
import { useAuth } from '@/admin/AuthProvider'
import { ApiError, apiDelete, apiPatch } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatRm } from '@/lib/format'
import useApiQuery from '@/lib/useApiQuery'
import JobFilterBar from '@/features/jobs/JobFilterBar'
import JobRowActions from '@/features/jobs/JobRowActions'
import PublishedBadge from '@/features/jobs/PublishedBadge'
import { hasActiveFilters, listQuery, readFilters } from '@/features/jobs/filters'

function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading jobs" className="divide-y divide-line">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="size-12 animate-pulse rounded-lg bg-line" />
          <div className="h-4 w-48 animate-pulse rounded bg-line" />
          <div className="hidden h-4 w-32 animate-pulse rounded bg-line md:block" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-line" />
        </div>
      ))}
    </div>
  )
}

export default function JobsPage() {
  const toast = useToast()
  const { admin } = useAuth()
  const [params, setParams] = useSearchParams()
  // Latest URL query, kept in a ref so two changes in a row both land.
  const latest = useRef(params)
  useEffect(() => {
    latest.current = params
  }, [params])

  const lookups = useApiQuery('/lookups')
  const categories = useMemo(
    () => lookups.data?.job_categories?.map(({ slug, name }) => ({ value: slug, label: name })) ?? null,
    [lookups.data],
  )
  const categoryValues = categories ? categories.map((category) => category.value) : null

  const filters = readFilters(params, { categoryValues })
  const { data, loading, error, reload, setData } = useApiQuery(`/admin/jobs?${listQuery(filters)}`)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(null)

  const update = useCallback(
    (changes) => {
      const next = new URLSearchParams(latest.current)
      Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
      latest.current = next
      setParams(next)
    },
    [setParams],
  )

  const reset = useCallback(() => {
    latest.current = new URLSearchParams()
    setParams(latest.current)
  }, [setParams])

  const jobs = data ?? []
  const filtered = hasActiveFilters(filters)
  const isSuper = admin.role === 'super_admin'

  const failure = (caught) =>
    caught instanceof ApiError && caught.status !== 0
      ? caught.message
      : 'Could not reach the server. Please try again.'

  const togglePublished = async (job) => {
    setBusy(true)
    setActionError('')
    try {
      const response = await apiPatch(`/admin/jobs/${job.id}`, { is_published: !job.is_published })
      setData((current) => current.map((item) => (item.id === job.id ? response.data : item)))
      toast.success(
        response.data.is_published ? `${job.title} is now published.` : `${job.title} is now a draft.`,
      )
    } catch (caught) {
      setActionError(failure(caught))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const job = deleting
    setBusy(true)
    setActionError('')
    try {
      await apiDelete(`/admin/jobs/${job.id}`)
      setData((current) => current.filter((item) => item.id !== job.id))
      toast.success(`${job.title} was deleted.`)
    } catch (caught) {
      setActionError(failure(caught))
    } finally {
      setBusy(false)
      setDeleting(null)
    }
  }

  const actions = (job) => (
    <JobRowActions
      job={job}
      busy={busy}
      onTogglePublished={togglePublished}
      onDelete={isSuper ? setDeleting : undefined}
    />
  )

  return (
    <>
      <title>Jobs | Rifa International Admin</title>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">Jobs</h1>
          {data && (
            <p className="mt-0.5 text-body" aria-live="polite">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
              {filtered ? ' match your filters' : ''}
            </p>
          )}
        </div>
        <Button size="sm" iconLeft={Plus} to="/jobs/new">
          Add job
        </Button>
      </div>

      <JobFilterBar filters={filters} categories={categories} onChange={update} onReset={reset} />

      {actionError && (
        <Alert variant="error" className="mt-4">
          {actionError}
        </Alert>
      )}

      <section
        aria-label="Jobs"
        aria-busy={loading}
        className="mt-4 overflow-hidden rounded-card border border-line bg-white shadow-card"
      >
        {error && !loading ? (
          <div className="p-4">
            <Alert variant="error" title="The jobs could not be loaded">
              <p>{error.status === 0 ? 'Could not reach the server.' : error.message}</p>
              <Button size="sm" iconLeft={RotateCw} onClick={reload} className="mt-3">
                Try again
              </Button>
            </Alert>
          </div>
        ) : loading && !data ? (
          <ListSkeleton />
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <BriefcaseBusiness size={24} aria-hidden="true" />
            </span>
            <p className="mt-3 text-base font-semibold text-ink">
              {filtered ? 'No jobs match your filters.' : 'No jobs yet.'}
            </p>
            <p className="mt-1 text-body">
              {filtered
                ? 'Try different filters or clear them.'
                : 'Add the first job listing for the website.'}
            </p>
            {filtered ? (
              <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
                Reset filters
              </Button>
            ) : (
              <Button size="sm" iconLeft={Plus} className="mt-4" to="/jobs/new">
                Add job
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(loading && 'opacity-60 transition-opacity')}>
            <div className="relative hidden overflow-x-auto md:block">
              <table className="w-full min-w-[52rem] border-collapse text-sm">
                <thead className="bg-surface-2 text-xs tracking-wide text-ink uppercase">
                  <tr>
                    {['Job', 'Category', 'Location', 'Salary (RM / month)', 'Status', ''].map(
                      (heading, index) => (
                        <th key={index} scope="col" className="px-2.5 py-2.5 text-left font-semibold">
                          {heading || <span className="sr-only">Actions</span>}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-2.5 py-2.5">
                        <div className="flex items-center gap-3">
                          <JobPhoto publicId={job.image_public_id} className="size-12 shrink-0" />
                          <div className="min-w-0">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="block rounded-sm font-semibold text-primary-700 hover:underline"
                            >
                              {job.title}
                            </Link>
                            <span className="block text-xs text-muted">{job.employer_type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5">{job.category?.name}</td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">{job.location}</td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">
                        {formatRm(job.salary_min, job.salary_max)}
                      </td>
                      <td className="px-2.5 py-2.5">
                        <PublishedBadge published={job.is_published} />
                      </td>
                      <td className="px-2.5 py-2.5">{actions(job)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {jobs.map((job) => (
                <li key={job.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <JobPhoto publicId={job.image_public_id} className="size-12 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/jobs/${job.id}`} className="font-semibold text-primary-700">
                          {job.title}
                        </Link>
                        <PublishedBadge published={job.is_published} />
                      </div>
                      <p className="text-xs text-muted">
                        {job.employer_type} · {job.category?.name}
                      </p>
                      <p className="mt-0.5 text-xs text-body">
                        {job.location} · {formatRm(job.salary_min, job.salary_max)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5">{actions(job)}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this job?"
        confirmLabel="Delete job"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      >
        <p>
          <strong className="font-semibold text-ink">{deleting?.title}</strong> and its photo will be removed
          from the website for good. To hide it instead, use Unpublish.
        </p>
      </ConfirmDialog>
    </>
  )
}

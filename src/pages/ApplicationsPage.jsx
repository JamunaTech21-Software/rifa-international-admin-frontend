import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { Download, FileSearch, RotateCw } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import { apiUrl } from '@/lib/api'
import { cn } from '@/lib/cn'
import { statusOptions } from '@/lib/statuses'
import useApiQuery from '@/lib/useApiQuery'
import { CardList, Table } from '@/features/applications/ApplicationsTable'
import FilterBar from '@/features/applications/FilterBar'
import {
  PER_PAGE,
  exportQuery,
  hasActiveFilters,
  listQuery,
  readFilters,
} from '@/features/applications/filters'

const STATUS_VALUES = statusOptions.map((option) => option.value)

function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading applications" className="divide-y divide-line">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-4 w-36 animate-pulse rounded bg-line" />
          <div className="h-4 w-40 animate-pulse rounded bg-line" />
          <div className="hidden h-4 w-28 animate-pulse rounded bg-line md:block" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-line" />
        </div>
      ))}
    </div>
  )
}

export default function ApplicationsPage() {
  const [params, setParams] = useSearchParams()
  // Latest URL query, kept in a ref so two changes in a row (e.g. a date range) both land.
  const latest = useRef(params)
  useEffect(() => {
    latest.current = params
  }, [params])

  // Job categories for the filter come from the public lookups endpoint.
  const lookups = useApiQuery('/lookups')
  const categories = useMemo(
    () => lookups.data?.job_categories?.map(({ slug, name }) => ({ value: slug, label: name })) ?? null,
    [lookups.data],
  )
  const categoryValues = categories ? categories.map((category) => category.value) : null

  const filters = readFilters(params, { statusValues: STATUS_VALUES, categoryValues })
  const { data, meta, loading, error, reload } = useApiQuery(`/admin/applications?${listQuery(filters)}`)

  // Any change goes into the URL. A filter change returns to page 1; empty values and defaults are left out.
  const update = useCallback(
    (changes) => {
      const next = new URLSearchParams(latest.current)
      Object.entries(changes).forEach(([key, value]) => {
        if (value && !(key === 'sort' && value === '-created_at') && !(key === 'page' && value === 1)) {
          next.set(key, String(value))
        } else {
          next.delete(key)
        }
      })
      if (!('page' in changes)) next.delete('page')
      latest.current = next
      setParams(next)
    },
    [setParams],
  )

  const reset = useCallback(() => {
    latest.current = new URLSearchParams()
    setParams(latest.current)
  }, [setParams])

  const rows = data ?? []
  const total = meta?.total ?? 0
  const filtered = hasActiveFilters(filters)
  const pageOutOfRange = !loading && !error && rows.length === 0 && total > 0 && filters.page > 1
  const exportHref = apiUrl(`/admin/applications/export?${exportQuery(filters)}`)

  return (
    <>
      <title>Applications | Rifa International Admin</title>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">Applications</h1>
          {meta && (
            <p className="mt-0.5 text-body" aria-live="polite">
              {total} {total === 1 ? 'application' : 'applications'}
              {filtered ? ' match your filters' : ''}
            </p>
          )}
        </div>
        <Button href={exportHref} variant="outline" size="sm" iconLeft={Download}>
          Export CSV
        </Button>
      </div>

      <FilterBar filters={filters} categories={categories} onChange={update} onReset={reset} />

      <section
        aria-label="Applications"
        aria-busy={loading}
        className="mt-4 overflow-hidden rounded-card border border-line bg-white shadow-card"
      >
        {error && !loading ? (
          <div className="p-4">
            <Alert variant="error" title="The applications could not be loaded">
              <p>{error.status === 0 ? 'Could not reach the server.' : error.message}</p>
              <Button size="sm" iconLeft={RotateCw} onClick={reload} className="mt-3">
                Try again
              </Button>
            </Alert>
          </div>
        ) : loading && !data ? (
          <ListSkeleton />
        ) : pageOutOfRange ? (
          <div className="px-4 py-12 text-center">
            <p className="font-semibold text-ink">There is no page {filters.page}.</p>
            <Button size="sm" className="mt-4" onClick={() => update({ page: 1 })}>
              Go to the first page
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <FileSearch size={24} aria-hidden="true" />
            </span>
            <p className="mt-3 text-base font-semibold text-ink">
              {filtered ? 'No applications match your filters.' : 'No applications yet.'}
            </p>
            <p className="mt-1 text-body">
              {filtered
                ? 'Try different filters or clear them.'
                : 'New applications from the website will appear here.'}
            </p>
            {filtered && (
              <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(loading && 'opacity-60 transition-opacity')}>
            <div className="relative hidden overflow-x-auto md:block">
              <Table rows={rows} sort={filters.sort} onSort={(sort) => update({ sort })} />
            </div>
            <div className="md:hidden">
              <CardList rows={rows} />
            </div>
          </div>
        )}
      </section>

      <Pagination
        className="mt-4"
        page={filters.page}
        perPage={PER_PAGE}
        total={total}
        onChange={(page) => {
          update({ page })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </>
  )
}

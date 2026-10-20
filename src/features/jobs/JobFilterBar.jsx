import { useEffect, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import Select from '@/components/form/Select'
import TextInput from '@/components/form/TextInput'
import { hasActiveFilters, jobStatusOptions } from '@/features/jobs/filters'

const SEARCH_DELAY_MS = 400
const control = 'h-10 text-sm'

function Field({ label, htmlFor, children, className }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-ink">
        {label}
      </label>
      {children}
    </div>
  )
}

/** Search and filters above the jobs list. Selects apply at once; the search box 0.4 s after typing stops. */
export default function JobFilterBar({ filters, categories, onChange, onReset }) {
  const [draft, setDraft] = useState(filters.q)
  const [syncedQ, setSyncedQ] = useState(filters.q)

  // When the URL changes by itself (Reset, Back button, a pasted link) show it in the box.
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q)
    if (filters.q !== draft.trim()) setDraft(filters.q)
  }

  useEffect(() => {
    if (draft.trim() === filters.q) return undefined
    const timer = setTimeout(() => onChange({ q: draft.trim() }), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [draft, filters.q, onChange])

  return (
    <form
      role="search"
      aria-label="Filter jobs"
      onSubmit={(event) => {
        event.preventDefault()
        onChange({ q: draft.trim() })
      }}
      className="rounded-card border border-line bg-white p-4 shadow-card"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <Field label="Search" htmlFor="j-q" className="sm:col-span-2 lg:col-span-1">
          <TextInput
            id="j-q"
            icon={Search}
            type="search"
            className={control}
            placeholder="Title, employer type or location"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="j-status">
          <Select
            id="j-status"
            className={control}
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value })}
            options={[{ value: '', label: 'All statuses' }, ...jobStatusOptions]}
          />
        </Field>
        <Field label="Job category" htmlFor="j-category">
          <Select
            id="j-category"
            className={control}
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
            options={[{ value: '', label: 'All categories' }, ...(categories ?? [])]}
          />
        </Field>
        <div className="flex items-end sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconLeft={RotateCcw}
            onClick={onReset}
            disabled={!hasActiveFilters(filters)}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  )
}

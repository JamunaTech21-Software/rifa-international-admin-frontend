import { useEffect, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import DateInput from '@/components/form/DateInput'
import Select from '@/components/form/Select'
import TextInput from '@/components/form/TextInput'
import { statusOptions } from '@/lib/statuses'
import {
  flagOptions,
  genderOptions,
  hasActiveFilters,
  passportOptions,
} from '@/features/applications/filters'

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

/**
 * Search and filters above the applications table. Selects and dates apply at once; the search box applies
 * 0.4 s after typing stops (or on Enter). onChange(partial) merges into the URL; onReset clears everything.
 */
export default function FilterBar({ filters, categories, onChange, onReset }) {
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

  const categoryOptions = categories ?? []

  return (
    <form
      role="search"
      aria-label="Filter applications"
      onSubmit={(event) => {
        event.preventDefault()
        onChange({ q: draft.trim() })
      }}
      className="rounded-card border border-line bg-white p-4 shadow-card"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Search" htmlFor="f-q" className="sm:col-span-2">
          <TextInput
            id="f-q"
            icon={Search}
            type="search"
            className={control}
            placeholder="Name, reference, NID, email or mobile"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="f-status">
          <Select
            id="f-status"
            className={control}
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value })}
            options={[{ value: '', label: 'All statuses' }, ...statusOptions]}
          />
        </Field>
        <Field label="Job category" htmlFor="f-category">
          <Select
            id="f-category"
            className={control}
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
            options={[{ value: '', label: 'All categories' }, ...categoryOptions]}
          />
        </Field>
        <Field label="Passport" htmlFor="f-passport">
          <Select
            id="f-passport"
            className={control}
            value={filters.passport_status}
            onChange={(event) => onChange({ passport_status: event.target.value })}
            options={[{ value: '', label: 'Any passport status' }, ...passportOptions]}
          />
        </Field>
        <Field label="Gender" htmlFor="f-gender">
          <Select
            id="f-gender"
            className={control}
            value={filters.gender}
            onChange={(event) => onChange({ gender: event.target.value })}
            options={[{ value: '', label: 'Any gender' }, ...genderOptions]}
          />
        </Field>
        <Field label="Flags" htmlFor="f-flag">
          <Select
            id="f-flag"
            className={control}
            value={filters.flag}
            onChange={(event) => onChange({ flag: event.target.value })}
            options={[{ value: '', label: 'No flag filter' }, ...flagOptions]}
          />
        </Field>
        <Field label="Submitted from" htmlFor="f-from">
          <DateInput
            id="f-from"
            className={control}
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => onChange({ from: event.target.value })}
          />
        </Field>
        <Field label="Submitted to" htmlFor="f-to">
          <DateInput
            id="f-to"
            className={control}
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => onChange({ to: event.target.value })}
          />
        </Field>
        <div className="flex items-end sm:justify-end lg:col-span-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconLeft={RotateCcw}
            onClick={onReset}
            disabled={!hasActiveFilters(filters) && filters.sort === '-created_at'}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  )
}

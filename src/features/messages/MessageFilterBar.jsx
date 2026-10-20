import { useEffect, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import Select from '@/components/form/Select'
import TextInput from '@/components/form/TextInput'
import { hasActiveFilters, messageStatusOptions } from '@/features/messages/filters'

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
 * Search and filters above the messages table. Selects apply at once; the search box applies 0.4 s after typing
 * stops (or on Enter). onChange(partial) merges into the URL; onReset clears everything.
 */
export default function MessageFilterBar({ filters, subjects, onChange, onReset }) {
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
      aria-label="Filter messages"
      onSubmit={(event) => {
        event.preventDefault()
        onChange({ q: draft.trim() })
      }}
      className="rounded-card border border-line bg-white p-4 shadow-card"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <Field label="Search" htmlFor="m-q" className="sm:col-span-2 lg:col-span-1">
          <TextInput
            id="m-q"
            icon={Search}
            type="search"
            className={control}
            placeholder="Name, email, phone or message text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="m-status">
          <Select
            id="m-status"
            className={control}
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value })}
            options={[{ value: '', label: 'All except archived' }, ...messageStatusOptions]}
          />
        </Field>
        <Field label="Subject" htmlFor="m-subject">
          <Select
            id="m-subject"
            className={control}
            value={filters.subject}
            onChange={(event) => onChange({ subject: event.target.value })}
            options={[{ value: '', label: 'All subjects' }, ...(subjects ?? [])]}
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

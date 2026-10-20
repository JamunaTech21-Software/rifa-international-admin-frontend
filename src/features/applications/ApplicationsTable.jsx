import { Link, useNavigate } from 'react-router'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { cn } from '@/lib/cn'
import { formatDateTime, formatDateTimeShort } from '@/lib/format'
import { statusLabel } from '@/lib/statuses'
import FlagIcons from '@/features/applications/FlagIcons'
import { passportOptions } from '@/features/applications/filters'

const passportLabel = (value) => passportOptions.find((option) => option.value === value)?.label ?? value

// A column title that sorts when clicked. `asc` / `desc` are the two API sort values for the column.
function SortHeader({ label, asc, desc, first, sort, onSort }) {
  const active = sort === asc ? 'ascending' : sort === desc ? 'descending' : 'none'
  const Icon = active === 'ascending' ? ArrowUp : active === 'descending' ? ArrowDown : ArrowUpDown
  return (
    <th scope="col" aria-sort={active} className="px-2.5 py-2.5 text-left font-semibold">
      <button
        type="button"
        onClick={() => onSort(sort === asc ? desc : sort === desc ? asc : first)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm hover:text-primary-700',
          active !== 'none' && 'text-primary-700',
        )}
      >
        {label}
        <Icon size={14} aria-hidden="true" />
      </button>
    </th>
  )
}

/** Desktop table. Whole rows are clickable; the reference and name are real links so the keyboard works too. */
export function Table({ rows, sort, onSort }) {
  const navigate = useNavigate()
  const th = 'px-2.5 py-2.5 text-left font-semibold'
  return (
    <table className="w-full min-w-[52rem] border-collapse text-sm">
      <thead className="bg-surface-2 text-xs tracking-wide text-ink uppercase">
        <tr>
          <th scope="col" className={th}>
            Reference
          </th>
          <SortHeader
            label="Name"
            asc="full_name"
            desc="-full_name"
            first="full_name"
            sort={sort}
            onSort={onSort}
          />
          <th scope="col" className={th}>
            Mobile
          </th>
          <th scope="col" className={th}>
            Category
          </th>
          <th scope="col" className={th}>
            Passport
          </th>
          <th scope="col" className={th}>
            Status
          </th>
          <th scope="col" className={th}>
            Flags
          </th>
          <SortHeader
            label="Submitted (GMT+6)"
            asc="created_at"
            desc="-created_at"
            first="-created_at"
            sort={sort}
            onSort={onSort}
          />
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((item) => (
          <tr
            key={item.id}
            onClick={() => navigate(`/applications/${item.id}`)}
            className="cursor-pointer transition-colors hover:bg-primary-50/60"
          >
            <td className="px-2.5 py-2.5 whitespace-nowrap">
              <Link
                to={`/applications/${item.id}`}
                onClick={(event) => event.stopPropagation()}
                className="rounded-sm font-semibold text-primary-700 hover:underline"
              >
                {item.reference_no}
              </Link>
            </td>
            <td className="px-2.5 py-2.5">
              <span className="block font-semibold text-ink">{item.full_name}</span>
              {item.email && <span className="block text-xs text-muted">{item.email}</span>}
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">{item.mobile}</td>
            <td className="px-2.5 py-2.5">{item.category?.name}</td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">{passportLabel(item.passport_status)}</td>
            <td className="px-2.5 py-2.5">
              <StatusBadge status={item.status} label={statusLabel(item.status)} />
            </td>
            <td className="px-2.5 py-2.5">
              <FlagIcons application={item} />
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap text-body">
              {formatDateTimeShort(item.created_at)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Phone layout: one card per application. */
export function CardList({ rows }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((item) => (
        <li key={item.id}>
          <Link to={`/applications/${item.id}`} className="block px-4 py-3 hover:bg-surface">
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{item.full_name}</span>
                <span className="block text-xs text-primary-700">{item.reference_no}</span>
              </span>
              <StatusBadge status={item.status} label={statusLabel(item.status)} />
            </span>
            <span className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-body">
              <span>
                {item.category?.name} · {passportLabel(item.passport_status)}
              </span>
              <FlagIcons application={item} />
            </span>
            <span className="mt-1 flex items-center justify-between gap-3 text-xs text-muted">
              <span>{item.mobile}</span>
              <span>{formatDateTime(item.created_at)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

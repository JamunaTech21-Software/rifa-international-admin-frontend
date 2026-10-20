import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

// Page numbers to show: the first, the last and two on each side of the current page, with "…" for gaps.
function pageItems(page, pageCount) {
  const wanted = new Set([1, pageCount, page - 2, page - 1, page, page + 1, page + 2])
  const pages = [...wanted].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b)
  const items = []
  pages.forEach((n, index) => {
    if (index > 0 && n - pages[index - 1] > 1) items.push({ gap: true, key: `gap-${n}` })
    items.push({ page: n, key: n })
  })
  return items
}

const buttonClass =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40'

/**
 * "Showing 21–40 of 57" with Previous / numbered pages / Next. onChange(page) is called with the new page.
 */
export default function Pagination({ page, perPage, total, onChange, className }) {
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  if (total === 0) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(total, page * perPage)

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-3 text-sm', className)}
    >
      <p className="text-body">
        Showing{' '}
        <strong className="font-semibold text-ink">
          {from}–{to}
        </strong>{' '}
        of <strong className="font-semibold text-ink">{total}</strong>
      </p>
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          <button
            type="button"
            className={cn(
              buttonClass,
              'border-line-strong bg-white text-ink hover:border-primary-300 hover:bg-primary-50',
            )}
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        </li>
        {pageItems(page, pageCount).map((item) =>
          item.gap ? (
            <li key={item.key} aria-hidden="true" className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onChange(item.page)}
                aria-label={`Page ${item.page}`}
                aria-current={item.page === page ? 'page' : undefined}
                className={cn(
                  buttonClass,
                  item.page === page
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-line-strong bg-white text-ink hover:border-primary-300 hover:bg-primary-50',
                )}
              >
                {item.page}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={cn(
              buttonClass,
              'border-line-strong bg-white text-ink hover:border-primary-300 hover:bg-primary-50',
            )}
            disabled={page >= pageCount}
            onClick={() => onChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  )
}

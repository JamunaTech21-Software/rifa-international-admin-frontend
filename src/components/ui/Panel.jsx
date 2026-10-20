import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/** White card with a heading row (optional "View all" link). Admin dashboards and detail pages are built from these. */
export default function Panel({ title, action, children, className, bodyClassName }) {
  return (
    <section className={cn('rounded-card border border-line bg-white shadow-card', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {action && (
          <Link
            to={action.to}
            className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            {action.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </header>
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

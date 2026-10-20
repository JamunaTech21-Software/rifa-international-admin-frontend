import { cn } from '@/lib/cn'

/**
 * Label/value pairs for detail pages: <DetailList items={[{ label, value }]} />. Empty values show a dash.
 * Two columns on wider screens, one on phones.
 */
export default function DetailList({ items, className }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-3.5 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className={cn('min-w-0', item.wide && 'sm:col-span-2')}>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{item.label}</dt>
          <dd className="mt-0.5 break-words text-ink">
            {item.value || <span className="text-muted">–</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

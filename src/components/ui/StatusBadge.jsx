import { cn } from '@/lib/cn'
import { statusStyle } from '@/lib/statuses'

/** Coloured pill for an application status. label is the server's text ("Under review"). */
export default function StatusBadge({ status, label, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        statusStyle(status).badge,
        className,
      )}
    >
      {label ?? status}
    </span>
  )
}

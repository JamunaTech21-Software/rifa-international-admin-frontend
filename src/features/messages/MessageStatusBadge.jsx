import { cn } from '@/lib/cn'

const badgeStyles = {
  new: 'bg-primary-50 text-primary-700',
  read: 'bg-surface-2 text-body',
  replied: 'bg-success-50 text-success-700',
  archived: 'bg-surface-2 text-muted',
}

/** Coloured pill for a message status (new / read / replied / archived). label is the server's text. */
export default function MessageStatusBadge({ status, label, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        badgeStyles[status] ?? badgeStyles.read,
        className,
      )}
    >
      {label ?? status}
    </span>
  )
}

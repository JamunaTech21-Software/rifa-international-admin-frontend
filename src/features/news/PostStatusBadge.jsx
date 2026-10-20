import { cn } from '@/lib/cn'

const styles = {
  published: ['Published', 'bg-success-50 text-success-700'],
  scheduled: ['Scheduled', 'bg-primary-50 text-primary-700'],
  draft: ['Draft', 'bg-surface-2 text-muted'],
}

/** "Published" (live), "Scheduled" (goes live on its date) or "Draft" (hidden) pill. */
export default function PostStatusBadge({ status }) {
  const [label, style] = styles[status] ?? styles.draft
  return (
    <span
      className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', style)}
    >
      {label}
    </span>
  )
}

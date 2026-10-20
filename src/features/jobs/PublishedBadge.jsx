import { cn } from '@/lib/cn'

/** "Published" (live on the website) or "Draft" (hidden) pill. */
export default function PublishedBadge({ published }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        published ? 'bg-success-50 text-success-700' : 'bg-surface-2 text-muted',
      )}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

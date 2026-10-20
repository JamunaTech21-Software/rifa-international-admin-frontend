import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'

/** Edit / Publish-Unpublish / Delete buttons for one job. Delete is only passed (and shown) for super admins. */
export default function JobRowActions({ job, onTogglePublished, onDelete, busy }) {
  return (
    <div className="flex flex-wrap gap-2 md:flex-nowrap md:justify-end">
      <Button
        variant="outline"
        size="sm"
        iconLeft={Pencil}
        to={`/jobs/${job.id}`}
        aria-label={`Edit ${job.title}`}
      >
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        iconLeft={job.is_published ? EyeOff : Eye}
        onClick={() => onTogglePublished(job)}
        disabled={busy}
        aria-label={`${job.is_published ? 'Unpublish' : 'Publish'} ${job.title}`}
      >
        {job.is_published ? 'Unpublish' : 'Publish'}
      </Button>
      {onDelete && (
        <Button
          variant="dangerOutline"
          size="sm"
          iconLeft={Trash2}
          onClick={() => onDelete(job)}
          disabled={busy}
          aria-label={`Delete ${job.title}`}
        >
          Delete
        </Button>
      )}
    </div>
  )
}

import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'

/** Edit / Publish-Unpublish / Delete buttons for one post. Delete is only passed (and shown) for super admins. */
export default function PostRowActions({ post, onTogglePublished, onDelete, busy }) {
  return (
    <div className="flex flex-wrap gap-2 md:flex-nowrap md:justify-end">
      <Button
        variant="outline"
        size="sm"
        iconLeft={Pencil}
        to={`/news/${post.id}`}
        aria-label={`Edit ${post.title}`}
      >
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        iconLeft={post.is_published ? EyeOff : Eye}
        onClick={() => onTogglePublished(post)}
        disabled={busy}
        aria-label={`${post.is_published ? 'Unpublish' : 'Publish'} ${post.title}`}
      >
        {post.is_published ? 'Unpublish' : 'Publish'}
      </Button>
      {onDelete && (
        <Button
          variant="dangerOutline"
          size="sm"
          iconLeft={Trash2}
          onClick={() => onDelete(post)}
          disabled={busy}
          aria-label={`Delete ${post.title}`}
        >
          Delete
        </Button>
      )}
    </div>
  )
}

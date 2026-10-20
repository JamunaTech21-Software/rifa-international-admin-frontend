import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageSquarePlus } from 'lucide-react'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import FormField from '@/components/form/FormField'
import Textarea from '@/components/form/Textarea'
import { ApiError } from '@/lib/api'
import { formatDateTime } from '@/lib/format'

const schema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Please write a note.')
    .max(2000, 'The note must be 2000 characters or fewer.'),
})

/** Internal notes (newest first) with a form to add one. onAdd(body) returns a promise; it rejects on failure. */
export default function NotesPanel({ notes, onAdd }) {
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { body: '' } })

  const onSubmit = async ({ body }) => {
    setFormError('')
    try {
      await onAdd(body)
      reset({ body: '' })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.fields.body) {
        setError('body', { type: 'server', message: error.fields.body })
      } else {
        setFormError(
          error instanceof ApiError && error.status !== 0
            ? error.message
            : 'Could not reach the server. Please try again.',
        )
      }
    }
  }

  return (
    <Panel title={`Notes (${notes.length})`}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {formError && <Alert variant="error">{formError}</Alert>}
        <FormField label="Add a note" error={errors.body?.message}>
          <Textarea
            rows={3}
            placeholder="Write an internal note (only staff can see it)…"
            {...register('body')}
          />
        </FormField>
        <div className="flex justify-end">
          <Button type="submit" size="sm" iconLeft={MessageSquarePlus} loading={isSubmitting}>
            Add note
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="mt-4 text-muted">No notes yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg bg-surface p-3">
              <p className="break-words whitespace-pre-wrap text-ink">{note.body}</p>
              <p className="mt-1.5 text-xs text-muted">
                {note.admin?.name ?? 'Unknown'} · {formatDateTime(note.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

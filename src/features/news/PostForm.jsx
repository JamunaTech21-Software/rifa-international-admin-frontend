import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import DateInput from '@/components/form/DateInput'
import FormField from '@/components/form/FormField'
import Textarea from '@/components/form/Textarea'
import TextInput from '@/components/form/TextInput'
import { ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'

const FIELDS = ['title', 'excerpt', 'body', 'published_on']

const text = (label, min, max, plural) =>
  z
    .string()
    .trim()
    .min(1, `Please enter the ${label}.`)
    .refine(
      (value) => value.length >= min && value.length <= max,
      `${plural} must be ${min}–${max} characters.`,
    )

const schema = z.object({
  title: text('title', 5, 150, 'Title'),
  excerpt: text('summary', 10, 300, 'Summary'),
  body: z
    .string()
    .trim()
    .min(1, 'Please write the article.')
    .refine((value) => value.length >= 20 && value.length <= 20000, 'Article must be 20–20000 characters.'),
  published_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD).'),
  is_published: z.boolean(),
})

// Today in the browser's time zone, as YYYY-MM-DD.
const today = () => new Date().toLocaleDateString('en-CA')

const fromPost = (post) => ({
  title: post.title,
  excerpt: post.excerpt,
  body: post.body_text ?? (post.body ?? []).join('\n\n'),
  published_on: post.published_on,
  is_published: post.is_published,
})

/**
 * Create / edit form for a news post. post = null creates.
 * onSubmit(payload) must return a promise and reject with an ApiError on failure (422 messages land on the fields).
 */
export default function PostForm({ post, onSubmit }) {
  const editing = Boolean(post)
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: post
      ? fromPost(post)
      : { title: '', excerpt: '', body: '', published_on: today(), is_published: true },
  })

  const publishedOn = watch('published_on')
  const isPublished = watch('is_published')
  const scheduled = isPublished && /^\d{4}-\d{2}-\d{2}$/.test(publishedOn) && publishedOn > today()

  const submit = async (values) => {
    setFormError('')
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const known = FIELDS.filter((field) => error.fields[field])
        known.forEach((field) => setError(field, { type: 'server', message: error.fields[field] }))
        if (known.length === 0) setFormError(error.message)
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
    <form noValidate onSubmit={handleSubmit(submit)}>
      <Panel title={editing ? 'Article' : 'New article'}>
        <div className="grid gap-4 sm:grid-cols-2">
          {formError && (
            <Alert variant="error" className="sm:col-span-2">
              {formError}
            </Alert>
          )}
          <FormField label="Title" required error={errors.title?.message} className="sm:col-span-2">
            <TextInput placeholder="New Job Openings in Malaysia" {...register('title')} />
          </FormField>
          <FormField
            label="Summary"
            required
            hint="Shown on the news cards (10–300 characters)."
            error={errors.excerpt?.message}
            className="sm:col-span-2"
          >
            <Textarea rows={3} {...register('excerpt')} />
          </FormField>
          <FormField
            label="Article"
            required
            hint="Plain text. A blank line starts a new paragraph."
            error={errors.body?.message}
            className="sm:col-span-2"
          >
            <Textarea rows={14} {...register('body')} />
          </FormField>
          <FormField
            label="Date"
            required
            hint="A future date schedules the post: it appears on the website on that day."
            error={errors.published_on?.message}
          >
            <DateInput {...register('published_on')} />
          </FormField>
          <label className="flex items-start gap-3 self-start sm:mt-7">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-primary-600"
              {...register('is_published')}
            />
            <span>
              <span className="block font-semibold text-ink">Published</span>
              <span className="block text-sm text-muted">Untick to keep it as a draft.</span>
            </span>
          </label>
          {scheduled && (
            <Alert variant="info" className="sm:col-span-2">
              This post is scheduled: it will appear on the website on {formatDate(publishedOn)}.
            </Alert>
          )}
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2.5 border-t border-line pt-4">
          <Button variant="outline" size="sm" to="/news" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" iconLeft={Save} loading={isSubmitting}>
            {editing ? 'Save changes' : 'Create post'}
          </Button>
        </div>
      </Panel>
    </form>
  )
}

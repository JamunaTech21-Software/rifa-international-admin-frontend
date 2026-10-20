import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import FormField from '@/components/form/FormField'
import Select from '@/components/form/Select'
import Textarea from '@/components/form/Textarea'
import TextInput from '@/components/form/TextInput'
import { ApiError } from '@/lib/api'

const FIELDS = [
  'title',
  'employer_type',
  'job_category',
  'location',
  'salary_min',
  'salary_max',
  'description',
  'sort_order',
]

const text = (label, min, max, plural) =>
  z
    .string()
    .trim()
    .min(1, `Please enter the ${label}.`)
    .refine(
      (value) => value.length >= min && value.length <= max,
      `${plural} must be ${min}–${max} characters.`,
    )

const salary = (label) =>
  z
    .string()
    .trim()
    .min(1, `Please enter the ${label} salary.`)
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) <= 100000,
      `${label[0].toUpperCase()}${label.slice(1)} salary must be a whole number from 0 to 100000.`,
    )

const schema = z
  .object({
    title: text('job title', 2, 100, 'Job title'),
    employer_type: text('employer type', 2, 100, 'Employer type'),
    job_category: z.string().min(1, 'Please select a job category.'),
    location: text('location', 2, 100, 'Location'),
    salary_min: salary('minimum'),
    salary_max: salary('maximum'),
    description: z.string().trim().max(5000, 'Description must be 5000 characters or fewer.'),
    is_published: z.boolean(),
    sort_order: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 9999),
        'Order must be a whole number from 0 to 9999.',
      ),
  })
  .refine(
    (values) =>
      !/^\d+$/.test(values.salary_min) ||
      !/^\d+$/.test(values.salary_max) ||
      Number(values.salary_max) >= Number(values.salary_min),
    { path: ['salary_max'], message: 'Maximum salary must be at least the minimum salary.' },
  )

const emptyValues = {
  title: '',
  employer_type: '',
  job_category: '',
  location: '',
  salary_min: '',
  salary_max: '',
  description: '',
  is_published: true,
  sort_order: '',
}

const fromJob = (job) => ({
  title: job.title,
  employer_type: job.employer_type,
  job_category: job.category?.slug ?? '',
  location: job.location,
  salary_min: String(job.salary_min),
  salary_max: String(job.salary_max),
  description: job.description ?? '',
  is_published: job.is_published,
  sort_order: String(job.sort_order ?? ''),
})

/**
 * Create / edit form for a job listing. job = null creates; categories = [{ value, label }].
 * onSubmit(payload) must return a promise and reject with an ApiError on failure (422 messages land on the fields).
 */
export default function JobForm({ job, categories, onSubmit }) {
  const editing = Boolean(job)
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: job ? fromJob(job) : emptyValues })

  const submit = async (values) => {
    setFormError('')
    const payload = {
      title: values.title,
      employer_type: values.employer_type,
      job_category: values.job_category,
      location: values.location,
      salary_min: Number(values.salary_min),
      salary_max: Number(values.salary_max),
      description: values.description,
      is_published: values.is_published,
    }
    if (values.sort_order !== '') payload.sort_order = Number(values.sort_order)
    try {
      await onSubmit(payload)
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
      <Panel title={editing ? 'Job details' : 'New job'}>
        <div className="grid gap-4 sm:grid-cols-2">
          {formError && (
            <Alert variant="error" className="sm:col-span-2">
              {formError}
            </Alert>
          )}
          <FormField label="Job title" required error={errors.title?.message} className="sm:col-span-2">
            <TextInput placeholder="Construction Worker" {...register('title')} />
          </FormField>
          <FormField label="Employer type" required error={errors.employer_type?.message}>
            <TextInput placeholder="Construction Company" {...register('employer_type')} />
          </FormField>
          <FormField label="Job category" required error={errors.job_category?.message}>
            <Select
              placeholder="Select a category"
              options={categories ?? []}
              {...register('job_category')}
            />
          </FormField>
          <FormField label="Location in Malaysia" required error={errors.location?.message}>
            <TextInput placeholder="Kuala Lumpur" {...register('location')} />
          </FormField>
          <FormField
            label="Display order"
            hint="Lower numbers come first. Leave blank to put it at the end."
            error={errors.sort_order?.message}
          >
            <TextInput inputMode="numeric" placeholder="e.g. 1" {...register('sort_order')} />
          </FormField>
          <FormField label="Minimum salary (RM / month)" required error={errors.salary_min?.message}>
            <TextInput inputMode="numeric" placeholder="1800" {...register('salary_min')} />
          </FormField>
          <FormField label="Maximum salary (RM / month)" required error={errors.salary_max?.message}>
            <TextInput inputMode="numeric" placeholder="2200" {...register('salary_max')} />
          </FormField>
          <FormField
            label="Description"
            hint="Optional. Plain text; line breaks are kept."
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <Textarea rows={5} {...register('description')} />
          </FormField>
          <label className="flex items-start gap-3 sm:col-span-2">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-primary-600"
              {...register('is_published')}
            />
            <span>
              <span className="block font-semibold text-ink">Published</span>
              <span className="block text-sm text-muted">
                Untick to keep it as a draft that visitors cannot see.
              </span>
            </span>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2.5 border-t border-line pt-4">
          <Button variant="outline" size="sm" to="/jobs" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" iconLeft={Save} loading={isSubmitting}>
            {editing ? 'Save changes' : 'Create job'}
          </Button>
        </div>
      </Panel>
    </form>
  )
}

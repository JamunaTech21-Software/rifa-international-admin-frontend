import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import FormField from '@/components/form/FormField'
import Select from '@/components/form/Select'
import Textarea from '@/components/form/Textarea'
import TextInput from '@/components/form/TextInput'
import { ApiError, apiPost } from '@/lib/api'

// Text like [DATE] or [MEDICAL CENTRE] is a blank the admin must fill in; the server refuses to send while one is left.
const PLACEHOLDER = /\[[A-Z][A-Z ]*\]/

const schema = z
  .object({
    template: z.string().min(1, 'Please choose a template.'),
    subject: z
      .string()
      .trim()
      .min(1, 'Please enter a subject.')
      .min(3, 'Subject must be 3–200 characters.')
      .max(200, 'Subject must be 3–200 characters.'),
    body: z
      .string()
      .trim()
      .min(1, 'Please write the message.')
      .min(10, 'Message must be 10–5000 characters.')
      .max(5000, 'Message must be 10–5000 characters.'),
  })
  .superRefine((values, context) => {
    const left = values.body.match(PLACEHOLDER) ?? values.subject.match(PLACEHOLDER)
    if (left) {
      context.addIssue({
        code: 'custom',
        path: ['body'],
        message: `Replace ${left[0]} with the real details before sending.`,
      })
    }
  })

/**
 * "Send email" form: pick a template (it fills the subject and message, both editable) and send.
 * templates — from GET …/message-templates.   initial — { template, subject, body } to start with (used by "Send again").
 * onSent(message) is called with the logged message; delivery_status may still be "failed".
 */
export default function EmailPanel({ applicationId, templates, canEmail, initial, onSent }) {
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { template: '', subject: '', body: '' },
  })

  if (!canEmail) {
    return (
      <Panel title="Send email">
        <Alert variant="info">This applicant did not give an email address. Please call them instead.</Alert>
      </Panel>
    )
  }

  const pickTemplate = (event) => {
    const chosen = templates.find((template) => template.key === event.target.value)
    if (!chosen) return
    setValue('subject', chosen.subject, { shouldValidate: false })
    setValue('body', chosen.body, { shouldValidate: false })
  }

  const onSubmit = async (values) => {
    setFormError('')
    try {
      const response = await apiPost(`/admin/applications/${applicationId}/messages`, values)
      await onSent(response.data)
      reset({ template: '', subject: '', body: '' })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const known = ['template', 'subject', 'body'].filter((field) => error.fields[field])
        known.forEach((field) => setError(field, { type: 'server', message: error.fields[field] }))
        if (known.length === 0) setFormError(error.fields.email ?? error.message)
      } else {
        setFormError(
          error instanceof ApiError && error.status !== 0
            ? error.message
            : 'Could not reach the server. Please try again.',
        )
      }
    }
  }

  const template = register('template')

  return (
    <Panel title="Send email">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {formError && <Alert variant="error">{formError}</Alert>}
        <FormField label="Template" required error={errors.template?.message}>
          <Select
            className="h-10 text-sm"
            placeholder="Choose a template"
            options={templates.map(({ key, label }) => ({ value: key, label }))}
            {...template}
            onChange={(event) => {
              template.onChange(event)
              pickTemplate(event)
            }}
          />
        </FormField>
        <FormField label="Subject" required error={errors.subject?.message}>
          <TextInput className="h-10 text-sm" {...register('subject')} />
        </FormField>
        <FormField
          label="Message"
          required
          hint="Replace anything in [CAPITAL LETTERS] with the real details. Your name and the reference number are added automatically."
          error={errors.body?.message}
        >
          <Textarea rows={10} {...register('body')} />
        </FormField>
        <div className="flex justify-end">
          <Button type="submit" size="sm" iconLeft={Send} loading={isSubmitting}>
            Send email
          </Button>
        </div>
      </form>
    </Panel>
  )
}

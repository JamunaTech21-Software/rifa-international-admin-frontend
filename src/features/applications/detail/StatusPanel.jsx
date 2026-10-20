import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import StatusBadge from '@/components/ui/StatusBadge'
import FormField from '@/components/form/FormField'
import Select from '@/components/form/Select'
import Textarea from '@/components/form/Textarea'
import { ApiError } from '@/lib/api'
import { statusLabel } from '@/lib/statuses'

const schema = z.object({
  status: z.string().min(1, 'Please choose the new status.'),
  note: z.string().trim().max(1000, 'The note must be 1000 characters or fewer.'),
})

/**
 * Change the application's status: pick one of the statuses the server allows next, add an optional note,
 * save. onChange({ status, note }) must return a promise that rejects with an ApiError when the server refuses.
 */
export default function StatusPanel({ application, onChange }) {
  const allowed = application.allowed_next_statuses ?? []
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { status: '', note: '' } })

  const onSubmit = async ({ status, note }) => {
    setFormError('')
    try {
      await onChange({ status, note })
      reset({ status: '', note: '' })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.fields.status) {
        setError('status', { type: 'server', message: error.fields.status })
      } else if (error instanceof ApiError && error.status === 422 && error.fields.note) {
        setError('note', { type: 'server', message: error.fields.note })
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
    <Panel title="Status">
      <p className="mb-4 flex items-center gap-2 text-body">
        Current status
        <StatusBadge
          status={application.status}
          label={application.labels?.status ?? statusLabel(application.status)}
        />
      </p>

      {allowed.length === 0 ? (
        <p className="text-body">This status is final, so it cannot be changed here.</p>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {formError && <Alert variant="error">{formError}</Alert>}
          <FormField label="Move to" required error={errors.status?.message}>
            <Select
              className="h-10 text-sm"
              placeholder="Select the new status"
              options={allowed.map((value) => ({ value, label: statusLabel(value) }))}
              {...register('status')}
            />
          </FormField>
          <FormField
            label="Note"
            hint="Optional — saved with the status change."
            error={errors.note?.message}
          >
            <Textarea
              rows={3}
              placeholder="For example: documents verified, call on Sunday…"
              {...register('note')}
            />
          </FormField>
          <Button type="submit" size="sm" iconLeft={Check} loading={isSubmitting} fullWidth>
            Update status
          </Button>
        </form>
      )}
    </Panel>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import DetailList from '@/components/ui/DetailList'
import Panel from '@/components/ui/Panel'
import { useToast } from '@/components/ui/Toaster'
import FormField from '@/components/form/FormField'
import PasswordInput from '@/components/form/PasswordInput'
import { useAuth } from '@/admin/AuthProvider'
import { ApiError, apiPost } from '@/lib/api'
import { roleLabel } from '@/features/users/roles'

const schema = z
  .object({
    current_password: z.string().min(1, 'Please enter your current password.'),
    new_password: z
      .string()
      .min(10, 'Password must be 10–200 characters.')
      .max(200, 'Password must be 10–200 characters.'),
    confirm: z.string().min(1, 'Please repeat the new password.'),
  })
  .refine((values) => values.new_password === values.confirm, {
    path: ['confirm'],
    message: 'The passwords do not match.',
  })

export default function ProfilePage() {
  const { admin } = useAuth()
  const toast = useToast()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', new_password: '', confirm: '' },
  })

  const onSubmit = async ({ current_password, new_password }) => {
    setFormError('')
    try {
      await apiPost('/admin/auth/change-password', { current_password, new_password })
      reset()
      toast.success('Password changed. Your other sessions were signed out.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const known = ['current_password', 'new_password'].filter((field) => error.fields[field])
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
    <>
      <title>Profile | Rifa International Admin</title>
      <h1 className="mb-5 text-2xl">Profile</h1>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Panel title="Your account">
          <DetailList
            items={[
              { label: 'Name', value: admin.name },
              { label: 'Email', value: admin.email },
              { label: 'Role', value: roleLabel(admin.role) },
            ]}
          />
        </Panel>

        <Panel title="Change password">
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {formError && <Alert variant="error">{formError}</Alert>}
            <FormField label="Current password" required error={errors.current_password?.message}>
              <PasswordInput autoComplete="current-password" {...register('current_password')} />
            </FormField>
            <FormField
              label="New password"
              required
              hint="10–200 characters, different from the current one."
              error={errors.new_password?.message}
            >
              <PasswordInput autoComplete="new-password" {...register('new_password')} />
            </FormField>
            <FormField label="Repeat new password" required error={errors.confirm?.message}>
              <PasswordInput autoComplete="new-password" {...register('confirm')} />
            </FormField>
            <Button type="submit" size="sm" iconLeft={KeyRound} loading={isSubmitting}>
              Change password
            </Button>
          </form>
        </Panel>
      </div>
    </>
  )
}

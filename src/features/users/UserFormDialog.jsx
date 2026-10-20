import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/form/FormField'
import PasswordInput from '@/components/form/PasswordInput'
import Select from '@/components/form/Select'
import TextInput from '@/components/form/TextInput'
import { ApiError } from '@/lib/api'
import { roleOptions } from '@/features/users/roles'

const passwordRule = z
  .string()
  .min(10, 'Password must be 10–200 characters.')
  .max(200, 'Password must be 10–200 characters.')
const name = z
  .string()
  .trim()
  .min(1, 'Please enter the name.')
  .max(120, 'The name must be 120 characters or fewer.')
const role = z.enum(['staff', 'super_admin'], { error: 'Please choose a role.' })

const createSchema = z.object({
  name,
  email: z.string().trim().min(1, 'Please enter the email address.').email('Enter a valid email address.'),
  role,
  password: passwordRule,
})

// When editing, a blank password means "leave it as it is".
const editSchema = z.object({
  name,
  role,
  password: z.union([z.literal(''), passwordRule]),
})

function UserForm({ user, isSelf, onSubmit, onCancel }) {
  const editing = Boolean(user)
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editing ? editSchema : createSchema),
    defaultValues: editing
      ? { name: user.name, role: user.role, password: '' }
      : { name: '', email: '', role: 'staff', password: '' },
  })

  const submit = async (values) => {
    setFormError('')
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const known = Object.keys(error.fields).filter((field) =>
          ['name', 'email', 'role', 'password'].includes(field),
        )
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
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
      {formError && <Alert variant="error">{formError}</Alert>}
      <FormField label="Full name" required error={errors.name?.message}>
        <TextInput autoComplete="off" {...register('name')} />
      </FormField>
      {editing ? (
        <p className="text-sm text-body">
          Email: <span className="font-semibold text-ink">{user.email}</span>
        </p>
      ) : (
        <FormField label="Email address" required error={errors.email?.message}>
          <TextInput type="email" autoComplete="off" {...register('email')} />
        </FormField>
      )}
      <FormField label="Role" required error={errors.role?.message}>
        <Select options={roleOptions} {...register('role')} />
      </FormField>
      {isSelf ? (
        <p className="text-sm text-body">To change your own password, use Profile → Change password.</p>
      ) : (
        <FormField
          label={editing ? 'New password' : 'Password'}
          required={!editing}
          hint={
            editing
              ? 'Leave blank to keep the current password. Setting one signs this person out everywhere.'
              : '10–200 characters.'
          }
          error={errors.password?.message}
        >
          <PasswordInput autoComplete="new-password" {...register('password')} />
        </FormField>
      )}
      <div className="flex flex-wrap justify-end gap-2.5 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting}>
          {editing ? 'Save changes' : 'Create admin'}
        </Button>
      </div>
    </form>
  )
}

/** Create / edit dialog for an admin user. user = null creates; onSubmit(values) must reject with an ApiError on failure. */
export default function UserFormDialog({ open, user, isSelf, onSubmit, onClose }) {
  return (
    <Dialog open={open} title={user ? 'Edit admin' : 'Add an admin'} onClose={onClose}>
      <UserForm user={user} isSelf={isSelf} onSubmit={onSubmit} onCancel={onClose} />
    </Dialog>
  )
}

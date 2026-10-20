import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CircleCheck, KeyRound } from 'lucide-react'
import { z } from 'zod'
import { ApiError, apiPost } from '@/lib/api'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import FormField from '@/components/form/FormField'
import TextInput from '@/components/form/TextInput'

// Same rule and message as the backend (backend/docs/api.md → change/reset password).
const schema = z
  .object({
    password: z
      .string()
      .min(10, 'Password must be 10–200 characters.')
      .max(200, 'Password must be 10–200 characters.'),
    confirm: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((values) => values.password === values.confirm, {
    path: ['confirm'],
    message: 'The two passwords do not match.',
  })

const LINK_PROBLEM = 'This reset link is invalid or has expired.'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [done, setDone] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [linkProblem, setLinkProblem] = useState(!token)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { password: '', confirm: '' } })

  const onSubmit = async ({ password }) => {
    setErrorMessage('')
    try {
      await apiPost('/admin/auth/reset-password', { token, password })
      setDone(true)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        if (error.fields.token) setLinkProblem(true)
        if (error.fields.password) setError('password', { type: 'server', message: error.fields.password })
        if (!error.fields.token && !error.fields.password) setErrorMessage(error.message)
      } else {
        setErrorMessage('Something went wrong. Please try again.')
      }
    }
  }

  const heading = (
    <>
      <title>Reset password | Rifa International Admin</title>
      <h1 className="text-2xl">Reset your password</h1>
    </>
  )

  if (done) {
    return (
      <>
        {heading}
        <div className="mt-4" role="status">
          <Alert variant="success" title="Password changed">
            Your password has been reset. Please sign in with your new password.
          </Alert>
        </div>
        <Button to="/login" size="lg" fullWidth iconLeft={CircleCheck} className="mt-5">
          Go to sign in
        </Button>
      </>
    )
  }

  if (linkProblem) {
    return (
      <>
        {heading}
        <Alert variant="error" className="mt-4">
          {LINK_PROBLEM} Please ask for a new one.
        </Alert>
        <Button to="/forgot-password" size="lg" fullWidth className="mt-5">
          Request a new link
        </Button>
        <p className="mt-5 text-center text-sm">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to sign in
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      {heading}
      <p className="mt-1 text-sm text-body">Choose a new password. It must be at least 10 characters long.</p>
      {errorMessage && (
        <Alert variant="error" className="mt-4">
          {errorMessage}
        </Alert>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <FormField label="New password" required error={errors.password?.message}>
          <TextInput icon={KeyRound} type="password" autoComplete="new-password" {...register('password')} />
        </FormField>
        <FormField label="Confirm new password" required error={errors.confirm?.message}>
          <TextInput icon={KeyRound} type="password" autoComplete="new-password" {...register('confirm')} />
        </FormField>
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Reset password'}
        </Button>
      </form>
    </>
  )
}

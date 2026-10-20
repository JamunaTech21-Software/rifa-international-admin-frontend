import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { z } from 'zod'
import { ApiError, apiPost } from '@/lib/api'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import FormField from '@/components/form/FormField'
import TextInput from '@/components/form/TextInput'

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .pipe(z.email('Enter a valid email address.')),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const onSubmit = async ({ email }) => {
    setErrorMessage('')
    try {
      await apiPost('/admin/auth/forgot-password', { email })
      setSent(true) // the server always answers 200, whether or not the email has an account
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.status === 429
          ? 'Too many attempts. Please try again later.'
          : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <>
      <title>Forgot password | Rifa International Admin</title>
      <h1 className="text-2xl">Forgot your password?</h1>

      {sent ? (
        <div className="mt-4" role="status">
          <Alert variant="success" title="Check your email">
            If an admin account exists for that address, we have sent a link to reset the password. The link
            works for 30 minutes.
          </Alert>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-body">
            Enter your email address and we will send you a reset link.
          </p>
          {errorMessage && (
            <Alert variant="error" className="mt-4">
              {errorMessage}
            </Alert>
          )}
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <FormField label="Email address" required error={errors.email?.message}>
              <TextInput
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="name@rifaint.com"
                {...register('email')}
              />
            </FormField>
            <Button type="submit" size="lg" fullWidth iconLeft={Send} loading={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </>
      )}

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

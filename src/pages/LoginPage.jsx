import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react'
import { z } from 'zod'
import { ApiError } from '@/lib/api'
import { safeNext } from '@/lib/nav'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import FormField from '@/components/form/FormField'
import TextInput from '@/components/form/TextInput'
import { useAuth } from '@/admin/AuthProvider'

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .pipe(z.email('Enter a valid email address.')),
  password: z.string().min(1, 'Please enter your password.'),
})

function failureMessage(error) {
  if (error instanceof ApiError) {
    if (error.code === 'invalid_credentials') return 'Invalid email or password.'
    if (error.status === 429)
      return error.message || 'Too many failed attempts. Please try again in 15 minutes.'
    if (error.status === 0) return 'Could not reach the server. Check your connection and try again.'
  }
  return 'Something went wrong. Please try again.'
}

export default function LoginPage() {
  const { status, expired, login } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const next = safeNext(params.get('next'))

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  // Already signed in (or just signed in): go where the person was heading.
  if (status === 'authed') return <Navigate to={next} replace />

  const onSubmit = async ({ email, password }) => {
    setErrorMessage('')
    try {
      await login(email, password)
      navigate(next, { replace: true })
    } catch (error) {
      setErrorMessage(failureMessage(error))
      if (error instanceof ApiError && error.status === 422) {
        Object.entries(error.fields).forEach(([field, message]) =>
          setError(field, { type: 'server', message }),
        )
      }
    }
  }

  return (
    <>
      <title>Sign in | Rifa International Admin</title>
      <h1 className="text-2xl">Sign in</h1>
      <p className="mt-1 text-sm text-body">Use your admin account to manage applications and messages.</p>

      {(expired || params.get('expired') === '1') && !errorMessage && (
        <Alert variant="info" className="mt-4">
          Your session has ended. Please sign in again.
        </Alert>
      )}
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
            autoComplete="username"
            placeholder="name@rifaint.com"
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" required error={errors.password?.message}>
          <div className="relative">
            <TextInput
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pr-12"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-lg text-muted hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </FormField>

        <Button type="submit" size="lg" fullWidth iconLeft={LogIn} loading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        <Link
          to="/forgot-password"
          className="rounded-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          Forgot your password?
        </Link>
      </p>
    </>
  )
}

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CircleAlert,
  Mail,
  MailOpen,
  Phone,
  RotateCw,
  Send,
  SearchX,
} from 'lucide-react'
import { z } from 'zod'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toaster'
import FormField from '@/components/form/FormField'
import Textarea from '@/components/form/Textarea'
import { ApiError, apiPatch, apiPost } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import useApiQuery from '@/lib/useApiQuery'
import MessageStatusBadge from '@/features/messages/MessageStatusBadge'

const replySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Please write a reply.')
    .max(5000, 'The reply must be 5000 characters or fewer.'),
})

function ReplyThread({ replies }) {
  if (replies.length === 0) return <p className="text-muted">No replies yet.</p>
  return (
    <ul className="space-y-3">
      {replies.map((reply) => (
        <li key={reply.id} className="rounded-lg bg-surface p-3">
          <p className="break-words whitespace-pre-wrap text-ink">{reply.body}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span>
              {reply.admin?.name ?? 'Unknown'} · {formatDateTime(reply.sent_at ?? reply.created_at)}
            </span>
            {reply.delivery_status === 'failed' ? (
              <span className="inline-flex items-center gap-1 font-semibold text-danger-600">
                <CircleAlert size={14} aria-hidden="true" />
                Email not delivered
              </span>
            ) : (
              <span>· Emailed to {reply.sent_to}</span>
            )}
          </p>
        </li>
      ))}
    </ul>
  )
}

function ReplyForm({ onSend }) {
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(replySchema), defaultValues: { body: '' } })

  const onSubmit = async ({ body }) => {
    setFormError('')
    try {
      await onSend(body)
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
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {formError && <Alert variant="error">{formError}</Alert>}
      <FormField
        label="Reply"
        hint="Sent by email to the sender. Replies from the sender reach the office inbox."
        error={errors.body?.message}
      >
        <Textarea rows={5} placeholder="Write your reply…" {...register('body')} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" size="sm" iconLeft={Send} loading={isSubmitting}>
          Send reply
        </Button>
      </div>
    </form>
  )
}

export default function MessageDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data, loading, error, reload, setData } = useApiQuery(`/admin/messages/${id}`)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState('')

  // Back goes to wherever the person came from (keeps the inbox's filters); direct visits go to the inbox.
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/messages'))

  const changeStatus = async (status, successMessage) => {
    setPending(true)
    setActionError('')
    try {
      const response = await apiPatch(`/admin/messages/${id}`, { status })
      setData(response.data)
      toast.success(successMessage)
    } catch (caught) {
      setActionError(
        caught instanceof ApiError && caught.status !== 0
          ? caught.message
          : 'Could not reach the server. Please try again.',
      )
    } finally {
      setPending(false)
    }
  }

  const sendReply = async (body) => {
    const response = await apiPost(`/admin/messages/${id}/replies`, { body })
    setData(response.data)
    const replies = response.data.replies ?? []
    if (replies.at(-1)?.delivery_status === 'failed') {
      // Saved, but the email could not be sent: tell the admin and keep the status as it is.
      toast.error('The reply was saved, but the email could not be sent. Please try again.')
    } else {
      toast.success('Reply sent.')
    }
  }

  if (loading && !data) {
    return (
      <div
        role="status"
        aria-label="Loading the message"
        className="flex justify-center py-20 text-primary-600"
      >
        <Spinner size="lg" label="Loading the message" />
      </div>
    )
  }

  if (error && !data) {
    const missing = error.status === 404
    return (
      <>
        <title>Message | Rifa International Admin</title>
        <div className="mx-auto max-w-md rounded-card border border-line bg-white p-8 text-center shadow-card">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <SearchX size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-xl">{missing ? 'Message not found' : 'Could not load the message'}</h1>
          <p className="mt-1.5 text-body">
            {missing
              ? 'It may have been removed, or the link is wrong.'
              : error.status === 0
                ? 'Could not reach the server.'
                : error.message}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {!missing && (
              <Button size="sm" iconLeft={RotateCw} onClick={reload}>
                Try again
              </Button>
            )}
            <Button size="sm" variant="outline" to="/messages">
              Back to messages
            </Button>
          </div>
        </div>
      </>
    )
  }

  const archived = data.status === 'archived'
  const replies = data.replies ?? []

  return (
    <>
      <title>{`${data.subject_label} – ${data.full_name} | Rifa International Admin`}</title>

      <button
        type="button"
        onClick={goBack}
        className="mb-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to messages
      </button>

      <header className="mb-5 rounded-card border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl break-words">{data.subject_label}</h1>
            <p className="mt-0.5 text-body">
              From <span className="font-semibold text-ink">{data.full_name}</span>
              <span className="mx-2 text-muted" aria-hidden="true">
                ·
              </span>
              Received {formatDateTime(data.created_at)} (GMT+6)
            </p>
          </div>
          <MessageStatusBadge status={data.status} label={data.status_label} className="px-3 py-1 text-sm" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            iconLeft={MailOpen}
            loading={pending}
            disabled={data.status === 'new' || archived}
            onClick={() => changeStatus('new', 'Marked as unread.')}
          >
            Mark unread
          </Button>
          {archived ? (
            <Button
              variant="outline"
              size="sm"
              iconLeft={ArchiveRestore}
              loading={pending}
              onClick={() => changeStatus('read', 'Message restored to the inbox.')}
            >
              Restore
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              iconLeft={Archive}
              loading={pending}
              onClick={() => changeStatus('archived', 'Message archived.')}
            >
              Archive
            </Button>
          )}
        </div>
      </header>

      {actionError && (
        <Alert variant="error" className="mb-4">
          {actionError}
        </Alert>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Panel title="Message">
            <p className="break-words whitespace-pre-wrap text-ink">{data.message}</p>
          </Panel>

          <Panel title={`Replies (${replies.length})`}>
            <ReplyThread replies={replies} />
          </Panel>

          <Panel title="Write a reply">
            <ReplyForm onSend={sendReply} />
          </Panel>
        </div>

        <div className="min-w-0">
          <Panel title="Sender">
            <dl className="space-y-3.5">
              <div className="min-w-0">
                <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Name</dt>
                <dd className="mt-0.5 break-words text-ink">{data.full_name}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Email</dt>
                <dd className="mt-0.5 break-words">
                  <a
                    className="inline-flex items-center gap-1.5 text-primary-700 hover:underline"
                    href={`mailto:${data.email}`}
                  >
                    <Mail size={16} aria-hidden="true" />
                    {data.email}
                  </a>
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Phone</dt>
                <dd className="mt-0.5 break-words">
                  {data.phone ? (
                    <a
                      className="inline-flex items-center gap-1.5 text-primary-700 hover:underline"
                      href={`tel:${data.phone}`}
                    >
                      <Phone size={16} aria-hidden="true" />
                      {data.phone}
                    </a>
                  ) : (
                    <span className="text-muted">–</span>
                  )}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  )
}

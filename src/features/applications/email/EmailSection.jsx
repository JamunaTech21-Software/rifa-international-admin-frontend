import { useState } from 'react'
import { RotateCw } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toaster'
import useApiQuery from '@/lib/useApiQuery'
import EmailLogPanel from '@/features/applications/email/EmailLogPanel'
import EmailPanel from '@/features/applications/email/EmailPanel'

/** Emails to the applicant: the send form (with templates) and the log of what was sent. */
export default function EmailSection({ applicationId }) {
  const toast = useToast()
  const templates = useApiQuery(`/admin/applications/${applicationId}/message-templates`)
  const log = useApiQuery(`/admin/applications/${applicationId}/messages`)
  // "Send again" on a failed email refills the form; changing `draft.id` restarts the form with these values.
  const [draft, setDraft] = useState({ id: 0, values: null })

  const sent = (message) => {
    log.setData((current) => [message, ...(current ?? [])])
    if (message.delivery_status === 'failed') {
      toast.error('The email could not be delivered. You can send it again from the log.')
    } else {
      toast.success(`Email sent to ${message.sent_to}.`)
    }
  }

  const resend = (message) => {
    setDraft((current) => ({
      id: current.id + 1,
      values: { template: message.template, subject: message.subject, body: message.body },
    }))
  }

  const failedToLoad = templates.error || log.error
  if (failedToLoad && !(templates.data && log.data)) {
    return (
      <Panel title="Send email">
        <Alert variant="error" title="The email tools could not be loaded">
          <p>{failedToLoad.status === 0 ? 'Could not reach the server.' : failedToLoad.message}</p>
          <Button
            size="sm"
            iconLeft={RotateCw}
            className="mt-3"
            onClick={() => {
              templates.reload()
              log.reload()
            }}
          >
            Try again
          </Button>
        </Alert>
      </Panel>
    )
  }

  if (!templates.data || !log.data) {
    return (
      <Panel title="Send email">
        <div
          role="status"
          aria-label="Loading email tools"
          className="flex justify-center py-6 text-primary-600"
        >
          <Spinner label="Loading email tools" />
        </div>
      </Panel>
    )
  }

  return (
    <>
      <EmailPanel
        key={draft.id}
        applicationId={applicationId}
        templates={templates.data.templates ?? []}
        canEmail={templates.data.can_email}
        initial={draft.values}
        onSent={sent}
      />
      <EmailLogPanel messages={log.data} onResend={resend} />
    </>
  )
}

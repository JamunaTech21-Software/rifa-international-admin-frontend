import { CircleAlert, CircleCheck, RotateCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'

/** Every email sent to the applicant from this page, newest first. Failed ones can be sent again. */
export default function EmailLogPanel({ messages, onResend }) {
  return (
    <Panel title={`Email log (${messages.length})`}>
      {messages.length === 0 ? (
        <p className="text-muted">No emails have been sent to this applicant yet.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => {
            const failed = message.delivery_status === 'failed'
            return (
              <li key={message.id} className="rounded-lg bg-surface p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 font-semibold break-words text-ink">{message.subject}</p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                      failed ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-700',
                    )}
                  >
                    {failed ? (
                      <CircleAlert size={14} aria-hidden="true" />
                    ) : (
                      <CircleCheck size={14} aria-hidden="true" />
                    )}
                    {failed ? 'Failed' : 'Sent'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  To {message.sent_to} · {message.admin?.name ?? 'Unknown'} ·{' '}
                  {formatDateTime(message.sent_at ?? message.created_at)}
                </p>
                {failed && message.error && (
                  <p className="mt-1.5 text-sm text-danger-600">Not delivered: {message.error}</p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer rounded-sm text-sm font-semibold text-primary-600 hover:text-primary-700">
                    Show message
                  </summary>
                  <p className="mt-2 text-sm break-words whitespace-pre-wrap text-ink">{message.body}</p>
                </details>
                {failed && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={RotateCw}
                    className="mt-2.5"
                    onClick={() => onResend(message)}
                  >
                    Send again
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

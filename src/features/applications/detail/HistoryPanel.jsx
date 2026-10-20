import { ArrowRight } from 'lucide-react'
import Panel from '@/components/ui/Panel'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/format'
import { statusLabel } from '@/lib/statuses'

/** Status history as a vertical timeline, newest first (the order the server sends). */
export default function HistoryPanel({ history }) {
  return (
    <Panel title="Status history">
      {history.length === 0 ? (
        <p className="text-muted">No status changes yet.</p>
      ) : (
        <ol className="relative ml-2 space-y-5 border-l-2 border-line pl-5">
          {history.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-[1.7rem] size-3 rounded-full border-2 border-white bg-primary-600 ring-2 ring-primary-100"
              />
              <p className="flex flex-wrap items-center gap-1.5">
                {entry.from_status ? (
                  <>
                    <StatusBadge status={entry.from_status} label={statusLabel(entry.from_status)} />
                    <ArrowRight size={14} className="text-muted" aria-label="changed to" role="img" />
                  </>
                ) : (
                  <span className="text-xs text-muted">Started as</span>
                )}
                <StatusBadge status={entry.to_status} label={statusLabel(entry.to_status)} />
              </p>
              {entry.note && <p className="mt-1.5 break-words whitespace-pre-wrap text-ink">{entry.note}</p>}
              <p className="mt-1 text-xs text-muted">
                {entry.changed_by?.name ?? 'System'} · {formatDateTime(entry.created_at)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

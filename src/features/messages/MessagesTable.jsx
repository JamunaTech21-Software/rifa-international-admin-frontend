import { Link, useNavigate } from 'react-router'
import { MessageSquareReply } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDateTime, formatDateTimeShort } from '@/lib/format'
import MessageStatusBadge from '@/features/messages/MessageStatusBadge'

// Unread (new) messages are bold so they stand out in the list.
const isUnread = (message) => message.status === 'new'

function Replies({ count }) {
  if (!count) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted" title={`${count} reply(ies) sent`}>
      <MessageSquareReply size={14} aria-hidden="true" />
      {count}
      <span className="sr-only">{count === 1 ? 'reply' : 'replies'}</span>
    </span>
  )
}

/** Desktop table. Whole rows are clickable; the sender name is a real link so the keyboard works too. */
export function Table({ rows }) {
  const navigate = useNavigate()
  const th = 'px-2.5 py-2.5 text-left font-semibold'
  return (
    <table className="w-full min-w-[48rem] border-collapse text-sm">
      <thead className="bg-surface-2 text-xs tracking-wide text-ink uppercase">
        <tr>
          <th scope="col" className={th}>
            From
          </th>
          <th scope="col" className={th}>
            Subject
          </th>
          <th scope="col" className={th}>
            Message
          </th>
          <th scope="col" className={th}>
            Status
          </th>
          <th scope="col" className={th}>
            Received (GMT+6)
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((item) => (
          <tr
            key={item.id}
            onClick={() => navigate(`/messages/${item.id}`)}
            className="cursor-pointer transition-colors hover:bg-primary-50/60"
          >
            <td className="px-2.5 py-2.5">
              <Link
                to={`/messages/${item.id}`}
                onClick={(event) => event.stopPropagation()}
                className={cn(
                  'block rounded-sm text-ink hover:underline',
                  isUnread(item) ? 'font-bold' : 'font-medium',
                )}
              >
                {item.full_name}
              </Link>
              <span className="block text-xs text-muted">{item.email}</span>
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap">{item.subject_label}</td>
            <td className="max-w-[22rem] px-2.5 py-2.5">
              <span className={cn('line-clamp-2', isUnread(item) ? 'font-semibold text-ink' : 'text-body')}>
                {item.excerpt}
              </span>
            </td>
            <td className="px-2.5 py-2.5">
              <span className="inline-flex items-center gap-2">
                <MessageStatusBadge status={item.status} label={item.status_label} />
                <Replies count={item.replies_count} />
              </span>
            </td>
            <td className="px-2.5 py-2.5 whitespace-nowrap text-body">
              {formatDateTimeShort(item.created_at)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Phone layout: one card per message. */
export function CardList({ rows }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((item) => (
        <li key={item.id}>
          <Link to={`/messages/${item.id}`} className="block px-4 py-3 hover:bg-surface">
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className={cn('block text-ink', isUnread(item) ? 'font-bold' : 'font-medium')}>
                  {item.full_name}
                </span>
                <span className="block text-xs text-primary-700">{item.subject_label}</span>
              </span>
              <MessageStatusBadge status={item.status} label={item.status_label} />
            </span>
            <span
              className={cn(
                'mt-2 line-clamp-2 block text-sm',
                isUnread(item) ? 'font-semibold text-ink' : 'text-body',
              )}
            >
              {item.excerpt}
            </span>
            <span className="mt-1 flex items-center justify-between gap-3 text-xs text-muted">
              <Replies count={item.replies_count} />
              <span className="ml-auto">{formatDateTime(item.created_at)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

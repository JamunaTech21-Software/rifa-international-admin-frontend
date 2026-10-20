import { useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Panel from '@/components/ui/Panel'
import { apiGet } from '@/lib/api'
import { formatFileSize } from '@/lib/format'

const typeLabels = { passport_copy: 'Passport copy', cv: 'CV / Resume' }
const typeLabel = (type) =>
  typeLabels[type] ?? type.replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase())

/**
 * Uploaded documents. "View" asks the server for a short-lived signed link (valid 5 minutes, logged in the audit
 * trail) and opens it in a new tab. The tab is opened first, inside the click, so the browser's pop-up blocker
 * allows it, and pointed at the link once it arrives.
 */
export default function DocumentsPanel({ applicationId, documents }) {
  const [openingId, setOpeningId] = useState(null)
  const [error, setError] = useState('')

  const view = async (document) => {
    setError('')
    setOpeningId(document.id)
    const tab = window.open('', '_blank')
    try {
      const response = await apiGet(`/admin/applications/${applicationId}/documents/${document.id}/url`)
      if (!tab) throw new Error('blocked')
      tab.opener = null
      tab.location.href = response.data.url
    } catch (caught) {
      tab?.close()
      setError(
        caught?.message === 'blocked'
          ? 'Your browser blocked the new tab. Allow pop-ups for this site and try again.'
          : 'The document could not be opened. Please try again.',
      )
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <Panel title={`Documents (${documents.length})`}>
      {error && (
        <Alert variant="error" className="mb-3">
          {error}
        </Alert>
      )}
      {documents.length === 0 ? (
        <p className="text-muted">No documents were uploaded.</p>
      ) : (
        <ul className="divide-y divide-line">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <FileText size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{typeLabel(document.doc_type)}</p>
                  <p className="truncate text-xs text-muted">
                    {document.original_filename} · {String(document.format).toUpperCase()} ·{' '}
                    {formatFileSize(document.bytes)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="shrink-0"
                size="sm"
                iconLeft={ExternalLink}
                loading={openingId === document.id}
                onClick={() => view(document)}
                aria-label={`View ${typeLabel(document.doc_type)}`}
              >
                View
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

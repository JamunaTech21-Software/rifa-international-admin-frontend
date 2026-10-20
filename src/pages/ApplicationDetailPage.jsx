import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, RotateCw, SearchX, Trash2 } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DetailList from '@/components/ui/DetailList'
import Panel from '@/components/ui/Panel'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import { useToast } from '@/components/ui/Toaster'
import { useAuth } from '@/admin/AuthProvider'
import { ApiError, apiDelete, apiPatch, apiPost } from '@/lib/api'
import { formatDate, formatDateTime } from '@/lib/format'
import { statusLabel } from '@/lib/statuses'
import useApiQuery from '@/lib/useApiQuery'
import FlagIcons from '@/features/applications/FlagIcons'
import DocumentsPanel from '@/features/applications/detail/DocumentsPanel'
import HistoryPanel from '@/features/applications/detail/HistoryPanel'
import NotesPanel from '@/features/applications/detail/NotesPanel'
import StatusPanel from '@/features/applications/detail/StatusPanel'
import EmailSection from '@/features/applications/email/EmailSection'

const flagText = (application) =>
  [application.is_age_flagged && 'Over 45', application.is_duplicate_flagged && 'Possible duplicate'].filter(
    Boolean,
  )

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { admin } = useAuth()
  const { data, loading, error, reload, setData } = useApiQuery(`/admin/applications/${id}`)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Back goes to wherever the person came from (keeps the list's filters); direct visits go to the list.
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/applications'))

  // Status change with an optimistic update: the badge changes at once, and is put back if the server refuses.
  const changeStatus = async ({ status, note }) => {
    const previous = data
    setData((current) => ({ ...current, status, labels: { ...current.labels, status: statusLabel(status) } }))
    try {
      const response = await apiPatch(
        `/admin/applications/${id}/status`,
        note ? { status, note } : { status },
      )
      setData(response.data)
      toast.success(`Status changed to ${statusLabel(status)}.`)
    } catch (caught) {
      setData(previous)
      throw caught
    }
  }

  const addNote = async (body) => {
    const response = await apiPost(`/admin/applications/${id}/notes`, { body })
    setData((current) => ({ ...current, notes: [response.data, ...current.notes] }))
    toast.success('Note added.')
  }

  const remove = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await apiDelete(`/admin/applications/${id}`)
      toast.success('Application deleted.')
      navigate('/applications', { replace: true })
    } catch (caught) {
      setDeleting(false)
      setDeleteError(
        caught instanceof ApiError && caught.status === 403
          ? 'Only a super admin can delete applications.'
          : 'The application could not be deleted. Please try again.',
      )
      setConfirmOpen(false)
    }
  }

  if (loading && !data) {
    return (
      <div
        role="status"
        aria-label="Loading the application"
        className="flex justify-center py-20 text-primary-600"
      >
        <Spinner size="lg" label="Loading the application" />
      </div>
    )
  }

  if (error && !data) {
    const missing = error.status === 404
    return (
      <>
        <title>Application | Rifa International Admin</title>
        <div className="mx-auto max-w-md rounded-card border border-line bg-white p-8 text-center shadow-card">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <SearchX size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-xl">
            {missing ? 'Application not found' : 'Could not load the application'}
          </h1>
          <p className="mt-1.5 text-body">
            {missing
              ? 'It may have been deleted, or the link is wrong.'
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
            <Button size="sm" variant="outline" to="/applications">
              Back to applications
            </Button>
          </div>
        </div>
      </>
    )
  }

  const labels = data.labels ?? {}
  const flags = flagText(data)

  return (
    <>
      <title>{`${data.full_name} | Rifa International Admin`}</title>

      <button
        type="button"
        onClick={goBack}
        className="mb-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to applications
      </button>

      <header className="mb-5 rounded-card border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl break-words">{data.full_name}</h1>
            <p className="mt-0.5 text-body">
              <span className="font-semibold text-primary-700">{data.reference_no}</span>
              <span className="mx-2 text-muted" aria-hidden="true">
                ·
              </span>
              Submitted {formatDateTime(data.created_at)} (GMT+6)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={data.status}
              label={labels.status ?? statusLabel(data.status)}
              className="px-3 py-1 text-sm"
            />
            <FlagIcons application={data} />
          </div>
        </div>
        {flags.length > 0 && (
          <p className="mt-3 text-sm text-tone-orange">
            Flags: {flags.join(' · ')}
            {data.is_age_flagged &&
              data.age_at_submission != null &&
              ` (age ${data.age_at_submission} at submission)`}
          </p>
        )}
      </header>

      {deleteError && (
        <Alert variant="error" className="mb-4">
          {deleteError}
        </Alert>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Panel title="Personal information">
            <DetailList
              items={[
                { label: 'Full name', value: data.full_name },
                { label: "Father's name", value: data.father_name },
                { label: 'Date of birth', value: data.date_of_birth && formatDate(data.date_of_birth) },
                {
                  label: 'Age at submission',
                  value: data.age_at_submission != null ? `${data.age_at_submission} years` : '',
                },
                { label: 'Gender', value: labels.gender },
                { label: 'National ID (NID)', value: data.nid_no },
              ]}
            />
          </Panel>

          <Panel title="Contact">
            <DetailList
              items={[
                {
                  label: 'Mobile',
                  value: data.mobile && (
                    <a className="text-primary-700 hover:underline" href={`tel:${data.mobile}`}>
                      {data.mobile}
                    </a>
                  ),
                },
                {
                  label: 'Email',
                  value: data.email && (
                    <a className="text-primary-700 hover:underline" href={`mailto:${data.email}`}>
                      {data.email}
                    </a>
                  ),
                },
                { label: 'Present address', value: data.present_address, wide: true },
              ]}
            />
          </Panel>

          <Panel title="Job preference">
            <DetailList
              items={[
                { label: 'Preferred job category', value: data.category?.name },
                { label: 'Work experience', value: labels.work_experience },
                { label: 'Highest education', value: labels.education_level },
                { label: 'Passport status', value: labels.passport_status },
              ]}
            />
          </Panel>

          <DocumentsPanel applicationId={id} documents={data.documents ?? []} />

          <EmailSection applicationId={id} />
        </div>

        <div className="min-w-0 space-y-5">
          <StatusPanel application={data} onChange={changeStatus} />
          <NotesPanel notes={data.notes ?? []} onAdd={addNote} />
          <HistoryPanel history={data.history ?? []} />

          {admin.role === 'super_admin' && (
            <Panel title="Danger zone">
              <p className="mb-3 text-body">
                Deleting removes the application from every list. This cannot be undone here.
              </p>
              <Button
                variant="dangerOutline"
                size="sm"
                iconLeft={Trash2}
                onClick={() => setConfirmOpen(true)}
              >
                Delete application
              </Button>
            </Panel>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this application?"
        confirmLabel="Delete application"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      >
        <p>
          <strong className="font-semibold text-ink">{data.full_name}</strong> ({data.reference_no}) will
          disappear from the applications list. Only a super admin can do this.
        </p>
      </ConfirmDialog>
    </>
  )
}

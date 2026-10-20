import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, RotateCw, SearchX, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Panel from '@/components/ui/Panel'
import PhotoPanel from '@/components/ui/PhotoPanel'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toaster'
import { useAuth } from '@/admin/AuthProvider'
import { apiDelete, apiPatch, apiPost } from '@/lib/api'
import useApiQuery from '@/lib/useApiQuery'
import JobForm from '@/features/jobs/JobForm'
import PublishedBadge from '@/features/jobs/PublishedBadge'

function BackLink({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary-600 hover:text-primary-700"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to jobs
    </button>
  )
}

/** /jobs/new creates a job; /jobs/:id edits one (and adds the photo, which needs a saved job). */
export default function JobFormPage() {
  const { id } = useParams()
  const editing = id !== undefined
  const navigate = useNavigate()
  const toast = useToast()
  const { admin } = useAuth()
  // The job itself (edit only; the empty path is never fetched) and the categories for the select.
  const job = useApiQuery(editing ? `/admin/jobs/${id}` : null)
  const lookups = useApiQuery('/lookups')
  const categories = useMemo(
    () => lookups.data?.job_categories?.map(({ slug, name }) => ({ value: slug, label: name })) ?? [],
    [lookups.data],
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saves, setSaves] = useState(0) // restarts the form after a save so it shows what the server stored

  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/jobs'))

  const save = async (payload) => {
    if (editing) {
      const response = await apiPatch(`/admin/jobs/${id}`, payload)
      job.setData(response.data)
      setSaves((count) => count + 1)
      toast.success('Job saved.')
    } else {
      const response = await apiPost('/admin/jobs', payload)
      toast.success('Job created. You can add a photo now.')
      navigate(`/jobs/${response.data.id}`, { replace: true })
    }
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await apiDelete(`/admin/jobs/${id}`)
      toast.success('Job deleted.')
      navigate('/jobs', { replace: true })
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
      toast.error('The job could not be deleted. Please try again.')
    }
  }

  if (editing && job.loading && !job.data) {
    return (
      <div role="status" aria-label="Loading the job" className="flex justify-center py-20 text-primary-600">
        <Spinner size="lg" label="Loading the job" />
      </div>
    )
  }

  if (editing && job.error && !job.data) {
    const missing = job.error.status === 404
    return (
      <>
        <title>Job | Rifa International Admin</title>
        <div className="mx-auto max-w-md rounded-card border border-line bg-white p-8 text-center shadow-card">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <SearchX size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-xl">{missing ? 'Job not found' : 'Could not load the job'}</h1>
          <p className="mt-1.5 text-body">
            {missing
              ? 'It may have been deleted, or the link is wrong.'
              : job.error.status === 0
                ? 'Could not reach the server.'
                : job.error.message}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {!missing && (
              <Button size="sm" iconLeft={RotateCw} onClick={job.reload}>
                Try again
              </Button>
            )}
            <Button size="sm" variant="outline" to="/jobs">
              Back to jobs
            </Button>
          </div>
        </div>
      </>
    )
  }

  const current = editing ? job.data : null

  return (
    <>
      <title>{`${current ? current.title : 'New job'} | Rifa International Admin`}</title>
      <BackLink onClick={goBack} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl break-words">{current ? current.title : 'Add a job'}</h1>
        {current && <PublishedBadge published={current.is_published} />}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <JobForm key={saves} job={current} categories={categories} onSubmit={save} />

        <div className="min-w-0 space-y-5">
          {current ? (
            <PhotoPanel
              endpoint={`/admin/jobs/${current.id}/image`}
              item={current}
              onChange={job.setData}
              emptyText="No photo yet. The website then shows the standard photo for the job category."
            />
          ) : (
            <Panel title="Photo">
              <p className="text-body">Save the job first, then you can add a photo here.</p>
            </Panel>
          )}

          {current && admin.role === 'super_admin' && (
            <Panel title="Danger zone">
              <p className="mb-3 text-body">
                Deleting removes the job and its photo from the website for good. To hide it instead, untick
                Published.
              </p>
              <Button
                variant="dangerOutline"
                size="sm"
                iconLeft={Trash2}
                onClick={() => setConfirmDelete(true)}
              >
                Delete job
              </Button>
            </Panel>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this job?"
        confirmLabel="Delete job"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      >
        <p>
          <strong className="font-semibold text-ink">{current?.title}</strong> and its photo will be removed
          from the website for good.
        </p>
      </ConfirmDialog>
    </>
  )
}

import { useState } from 'react'
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
import PostForm from '@/features/news/PostForm'
import PostStatusBadge from '@/features/news/PostStatusBadge'

function BackLink({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary-600 hover:text-primary-700"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to news
    </button>
  )
}

/** /news/new creates a post; /news/:id edits one (and adds the cover photo, which needs a saved post). */
export default function NewsFormPage() {
  const { id } = useParams()
  const editing = id !== undefined
  const navigate = useNavigate()
  const toast = useToast()
  const { admin } = useAuth()
  // The post itself (edit only; the empty path is never fetched).
  const post = useApiQuery(editing ? `/admin/news/${id}` : null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saves, setSaves] = useState(0) // restarts the form after a save so it shows what the server stored

  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/news'))

  const save = async (values) => {
    const payload = {
      title: values.title,
      excerpt: values.excerpt,
      body: values.body,
      published_on: values.published_on,
      is_published: values.is_published,
    }
    if (editing) {
      const response = await apiPatch(`/admin/news/${id}`, payload)
      post.setData(response.data)
      setSaves((count) => count + 1)
      toast.success('Post saved.')
    } else {
      const response = await apiPost('/admin/news', payload)
      toast.success('Post created. You can add a cover photo now.')
      navigate(`/news/${response.data.id}`, { replace: true })
    }
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await apiDelete(`/admin/news/${id}`)
      toast.success('Post deleted.')
      navigate('/news', { replace: true })
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
      toast.error('The post could not be deleted. Please try again.')
    }
  }

  if (editing && post.loading && !post.data) {
    return (
      <div role="status" aria-label="Loading the post" className="flex justify-center py-20 text-primary-600">
        <Spinner size="lg" label="Loading the post" />
      </div>
    )
  }

  if (editing && post.error && !post.data) {
    const missing = post.error.status === 404
    return (
      <>
        <title>Post | Rifa International Admin</title>
        <div className="mx-auto max-w-md rounded-card border border-line bg-white p-8 text-center shadow-card">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <SearchX size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-xl">{missing ? 'Post not found' : 'Could not load the post'}</h1>
          <p className="mt-1.5 text-body">
            {missing
              ? 'It may have been deleted, or the link is wrong.'
              : post.error.status === 0
                ? 'Could not reach the server.'
                : post.error.message}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {!missing && (
              <Button size="sm" iconLeft={RotateCw} onClick={post.reload}>
                Try again
              </Button>
            )}
            <Button size="sm" variant="outline" to="/news">
              Back to news
            </Button>
          </div>
        </div>
      </>
    )
  }

  const current = editing ? post.data : null

  return (
    <>
      <title>{`${current ? current.title : 'New post'} | Rifa International Admin`}</title>
      <BackLink onClick={goBack} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl break-words">{current ? current.title : 'Add a news post'}</h1>
        {current && <PostStatusBadge status={current.status} />}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <PostForm key={saves} post={current} onSubmit={save} />

        <div className="min-w-0 space-y-5">
          {current ? (
            <PhotoPanel
              endpoint={`/admin/news/${current.id}/image`}
              item={current}
              onChange={post.setData}
              emptyText="No cover photo yet. The website then shows its standard news photo."
            />
          ) : (
            <Panel title="Photo">
              <p className="text-body">Save the post first, then you can add a cover photo here.</p>
            </Panel>
          )}

          {current && admin.role === 'super_admin' && (
            <Panel title="Danger zone">
              <p className="mb-3 text-body">
                Deleting removes the post and its cover photo from the website for good. To hide it instead,
                untick Published.
              </p>
              <Button
                variant="dangerOutline"
                size="sm"
                iconLeft={Trash2}
                onClick={() => setConfirmDelete(true)}
              >
                Delete post
              </Button>
            </Panel>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this post?"
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      >
        <p>
          <strong className="font-semibold text-ink">{current?.title}</strong> and its cover photo will be
          removed from the website for good.
        </p>
      </ConfirmDialog>
    </>
  )
}

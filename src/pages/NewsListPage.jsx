import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Newspaper, Plus, RotateCw } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import JobPhoto from '@/components/ui/JobPhoto'
import { useToast } from '@/components/ui/Toaster'
import { useAuth } from '@/admin/AuthProvider'
import { ApiError, apiDelete, apiPatch } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import useApiQuery from '@/lib/useApiQuery'
import PostFilterBar from '@/features/news/PostFilterBar'
import PostRowActions from '@/features/news/PostRowActions'
import PostStatusBadge from '@/features/news/PostStatusBadge'
import { hasActiveFilters, listQuery, readFilters } from '@/features/news/filters'

function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading news" className="divide-y divide-line">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="size-12 animate-pulse rounded-lg bg-line" />
          <div className="h-4 w-56 animate-pulse rounded bg-line" />
          <div className="hidden h-4 w-24 animate-pulse rounded bg-line md:block" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-line" />
        </div>
      ))}
    </div>
  )
}

export default function NewsListPage() {
  const toast = useToast()
  const { admin } = useAuth()
  const [params, setParams] = useSearchParams()
  // Latest URL query, kept in a ref so two changes in a row both land.
  const latest = useRef(params)
  useEffect(() => {
    latest.current = params
  }, [params])

  const filters = readFilters(params)
  const { data, loading, error, reload, setData } = useApiQuery(`/admin/news?${listQuery(filters)}`)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(null)

  const update = useCallback(
    (changes) => {
      const next = new URLSearchParams(latest.current)
      Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
      latest.current = next
      setParams(next)
    },
    [setParams],
  )

  const reset = useCallback(() => {
    latest.current = new URLSearchParams()
    setParams(latest.current)
  }, [setParams])

  const posts = data ?? []
  const filtered = hasActiveFilters(filters)
  const isSuper = admin.role === 'super_admin'

  const failure = (caught) =>
    caught instanceof ApiError && caught.status !== 0
      ? caught.message
      : 'Could not reach the server. Please try again.'

  const togglePublished = async (post) => {
    setBusy(true)
    setActionError('')
    try {
      const response = await apiPatch(`/admin/news/${post.id}`, { is_published: !post.is_published })
      setData((current) => current.map((item) => (item.id === post.id ? response.data : item)))
      toast.success(
        response.data.is_published ? `"${post.title}" is now published.` : `"${post.title}" is now a draft.`,
      )
    } catch (caught) {
      setActionError(failure(caught))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const post = deleting
    setBusy(true)
    setActionError('')
    try {
      await apiDelete(`/admin/news/${post.id}`)
      setData((current) => current.filter((item) => item.id !== post.id))
      toast.success(`"${post.title}" was deleted.`)
    } catch (caught) {
      setActionError(failure(caught))
    } finally {
      setBusy(false)
      setDeleting(null)
    }
  }

  const actions = (post) => (
    <PostRowActions
      post={post}
      busy={busy}
      onTogglePublished={togglePublished}
      onDelete={isSuper ? setDeleting : undefined}
    />
  )

  return (
    <>
      <title>News | Rifa International Admin</title>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">News &amp; Updates</h1>
          {data && (
            <p className="mt-0.5 text-body" aria-live="polite">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              {filtered ? ' match your filters' : ''}
            </p>
          )}
        </div>
        <Button size="sm" iconLeft={Plus} to="/news/new">
          Add post
        </Button>
      </div>

      <PostFilterBar filters={filters} onChange={update} onReset={reset} />

      {actionError && (
        <Alert variant="error" className="mt-4">
          {actionError}
        </Alert>
      )}

      <section
        aria-label="News posts"
        aria-busy={loading}
        className="mt-4 overflow-hidden rounded-card border border-line bg-white shadow-card"
      >
        {error && !loading ? (
          <div className="p-4">
            <Alert variant="error" title="The news posts could not be loaded">
              <p>{error.status === 0 ? 'Could not reach the server.' : error.message}</p>
              <Button size="sm" iconLeft={RotateCw} onClick={reload} className="mt-3">
                Try again
              </Button>
            </Alert>
          </div>
        ) : loading && !data ? (
          <ListSkeleton />
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Newspaper size={24} aria-hidden="true" />
            </span>
            <p className="mt-3 text-base font-semibold text-ink">
              {filtered ? 'No posts match your filters.' : 'No news posts yet.'}
            </p>
            <p className="mt-1 text-body">
              {filtered ? 'Try different filters or clear them.' : 'Write the first article for the website.'}
            </p>
            {filtered ? (
              <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
                Reset filters
              </Button>
            ) : (
              <Button size="sm" iconLeft={Plus} className="mt-4" to="/news/new">
                Add post
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(loading && 'opacity-60 transition-opacity')}>
            <div className="relative hidden overflow-x-auto md:block">
              <table className="w-full min-w-[48rem] border-collapse text-sm">
                <thead className="bg-surface-2 text-xs tracking-wide text-ink uppercase">
                  <tr>
                    {['Post', 'Date', 'Status', ''].map((heading, index) => (
                      <th key={index} scope="col" className="px-2.5 py-2.5 text-left font-semibold">
                        {heading || <span className="sr-only">Actions</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-2.5 py-2.5">
                        <div className="flex items-center gap-3">
                          <JobPhoto publicId={post.image_public_id} className="size-12 shrink-0" />
                          <div className="min-w-0">
                            <Link
                              to={`/news/${post.id}`}
                              className="block rounded-sm font-semibold text-primary-700 hover:underline"
                            >
                              {post.title}
                            </Link>
                            <span className="line-clamp-1 block text-xs text-muted">{post.excerpt}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">{formatDate(post.published_on)}</td>
                      <td className="px-2.5 py-2.5">
                        <PostStatusBadge status={post.status} />
                      </td>
                      <td className="px-2.5 py-2.5">{actions(post)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {posts.map((post) => (
                <li key={post.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <JobPhoto publicId={post.image_public_id} className="size-12 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/news/${post.id}`} className="font-semibold text-primary-700">
                          {post.title}
                        </Link>
                        <PostStatusBadge status={post.status} />
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{post.excerpt}</p>
                      <p className="mt-0.5 text-xs text-body">{formatDate(post.published_on)}</p>
                    </div>
                  </div>
                  <div className="mt-2.5">{actions(post)}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this post?"
        confirmLabel="Delete post"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      >
        <p>
          <strong className="font-semibold text-ink">{deleting?.title}</strong> and its cover photo will be
          removed from the website for good. To hide it instead, use Unpublish.
        </p>
      </ConfirmDialog>
    </>
  )
}

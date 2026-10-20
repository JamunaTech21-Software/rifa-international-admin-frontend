import { useEffect, useMemo, useRef, useState } from 'react'
import { ImageUp, Trash2 } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import JobPhoto from '@/components/ui/JobPhoto'
import Panel from '@/components/ui/Panel'
import { useToast } from '@/components/ui/Toaster'
import { ApiError, apiDelete, apiPostForm } from '@/lib/api'
import { canShowPhotos } from '@/lib/cloudinary'
import { formatFileSize } from '@/lib/format'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Photo of a saved job or news post: shows the current one, lets the admin choose a new JPG/PNG/WebP (≤ 5 MB) and
 * upload it, or remove it.
 * endpoint — the record's image URL, e.g. "/admin/jobs/7/image" (POST uploads, DELETE removes).
 * item — the saved record (uses image_public_id); onChange(item) receives the updated record after an upload or removal.
 * emptyText — what the website shows when there is no photo.
 */
export default function PhotoPanel({ endpoint, item, onChange, emptyText }) {
  const toast = useToast()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const choose = (event) => {
    const chosen = event.target.files?.[0]
    setError('')
    if (!chosen) return setFile(null)
    if (!ALLOWED.includes(chosen.type)) {
      setFile(null)
      return setError('Photo must be a JPG, PNG or WebP image.')
    }
    if (chosen.size > MAX_BYTES) {
      setFile(null)
      return setError('Photo must be 5 MB or smaller.')
    }
    setFile(chosen)
  }

  const clearChoice = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const failure = (caught) =>
    caught instanceof ApiError && caught.status !== 0
      ? (caught.fields.image ?? caught.message)
      : 'Could not reach the server. Please try again.'

  const upload = async () => {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.append('image', file)
      const response = await apiPostForm(endpoint, form)
      onChange(response.data)
      clearChoice()
      toast.success('Photo uploaded.')
    } catch (caught) {
      setError(failure(caught))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      await apiDelete(endpoint)
      onChange({ ...item, image_public_id: null })
      toast.success('Photo removed.')
    } catch (caught) {
      setError(failure(caught))
    } finally {
      setBusy(false)
    }
  }

  const hasPhoto = Boolean(item.image_public_id)

  return (
    <Panel title="Photo">
      {error && (
        <Alert variant="error" className="mb-3">
          {error}
        </Alert>
      )}
      <div className="flex items-start gap-4">
        <JobPhoto publicId={item.image_public_id} previewUrl={preview} className="h-28 w-24 shrink-0" />
        <div className="min-w-0 text-sm text-body">
          {file ? (
            <p>
              <span className="font-semibold break-all text-ink">{file.name}</span> (
              {formatFileSize(file.size)}) — not uploaded yet.
            </p>
          ) : hasPhoto ? (
            <p>
              A photo is set.
              {!canShowPhotos && ' (The preview needs VITE_CLOUDINARY_CLOUD_NAME in .env.)'}
            </p>
          ) : (
            <p>{emptyText}</p>
          )}
          <p className="mt-1 text-xs text-muted">JPG, PNG or WebP, up to 5 MB.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        id="job-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={choose}
        className="sr-only"
        aria-label="Choose a photo"
      />
      <div className="mt-4 flex flex-wrap gap-2.5">
        {file ? (
          <>
            <Button size="sm" iconLeft={ImageUp} onClick={upload} loading={busy}>
              Upload photo
            </Button>
            <Button size="sm" variant="outline" onClick={clearChoice} disabled={busy}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              iconLeft={ImageUp}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {hasPhoto ? 'Replace photo' : 'Choose photo'}
            </Button>
            {hasPhoto && (
              <Button size="sm" variant="dangerOutline" iconLeft={Trash2} onClick={remove} loading={busy}>
                Remove photo
              </Button>
            )}
          </>
        )}
      </div>
    </Panel>
  )
}

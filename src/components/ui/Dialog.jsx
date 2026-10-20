import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Modal box built on <dialog>: focus stays inside, Esc and a click outside close it (unless busy).
 * Children are only mounted while open, so a form inside starts empty every time.
 *
 * open — whether it is shown.   title — heading.   onClose() — called for Esc, the X button and outside clicks.
 */
export default function Dialog({ open, title, busy = false, onClose, children }) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      onMouseDown={(event) => event.target === ref.current && !busy && onClose()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-line bg-white p-0 shadow-card-hover backdrop:bg-navy-950/50"
    >
      {open && (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-lg font-bold text-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-sm text-muted hover:text-ink disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

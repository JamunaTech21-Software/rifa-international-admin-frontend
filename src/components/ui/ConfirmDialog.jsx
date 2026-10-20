import { useEffect, useRef } from 'react'
import { TriangleAlert } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * Modal "Are you sure?" box built on <dialog>: focus stays inside, Esc and a click outside cancel.
 *
 * open — whether it is shown.   title / children — heading and explanation.
 * confirmLabel — text of the red button.   busy — disables the buttons and shows a spinner while working.
 * onConfirm() / onCancel() — callbacks.
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault() // Esc: let the page decide (ignored while a request is running)
        if (!busy) onCancel()
      }}
      onClick={(event) => event.target === ref.current && !busy && onCancel()}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-card border border-line bg-white p-0 shadow-card-hover backdrop:bg-navy-950/50"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-600">
            <TriangleAlert size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-lg font-bold text-ink">
              {title}
            </h2>
            <div className="mt-1.5 text-sm text-body">{children}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

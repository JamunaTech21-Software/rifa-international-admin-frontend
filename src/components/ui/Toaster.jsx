import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const ToastContext = createContext(null)
const DISMISS_MS = 5000

/**
 * Small pop-up messages ("Application deleted."). Wrap the app in <ToastProvider>, then call
 * const toast = useToast(); toast.success('…') or toast.error('…'). They are announced to screen readers,
 * disappear after 5 seconds and survive page changes (the provider sits above the router outlet).
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => setToasts((list) => list.filter((toast) => toast.id !== id)), [])

  const show = useCallback(
    (variant, message) => {
      const id = nextId.current++
      setToasts((list) => [...list, { id, variant, message }])
      setTimeout(() => dismiss(id), DISMISS_MS)
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({ success: (message) => show('success', message), error: (message) => show('error', message) }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const Icon = toast.variant === 'success' ? CircleCheck : CircleAlert
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-card border bg-white p-3.5 text-sm shadow-card-hover',
                toast.variant === 'success' ? 'border-success-600/30' : 'border-danger-600/30',
              )}
            >
              <Icon
                size={20}
                className={cn(
                  'mt-0.5 shrink-0',
                  toast.variant === 'success' ? 'text-success-600' : 'text-danger-600',
                )}
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-sm text-muted hover:text-ink"
                aria-label="Dismiss message"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}

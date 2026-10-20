import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'

const variants = {
  info: { box: 'border-primary-100 bg-primary-50', icon: Info, iconClass: 'text-primary-600' },
  success: { box: 'border-success-600/20 bg-success-50', icon: CircleCheck, iconClass: 'text-success-600' },
  warning: { box: 'border-warning-500/25 bg-warning-50', icon: CircleAlert, iconClass: 'text-warning-500' },
  error: { box: 'border-danger-600/20 bg-danger-50', icon: TriangleAlert, iconClass: 'text-danger-600' },
}

// Message box. Errors are announced to screen readers immediately (role="alert").
export default function Alert({ variant = 'info', title, className, children }) {
  const v = variants[variant]
  const Icon = v.icon
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-card border p-4 text-sm sm:p-5', v.box, className)}
    >
      <Icon size={22} className={cn('shrink-0', v.iconClass)} aria-hidden="true" />
      <div className="min-w-0 text-body">
        {title && <p className="mb-1 font-semibold text-ink">{title}</p>}
        {children}
      </div>
    </div>
  )
}

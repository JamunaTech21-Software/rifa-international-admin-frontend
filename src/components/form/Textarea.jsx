import { cn } from '@/lib/cn'
import { fieldBase, fieldInvalid } from '@/lib/formStyles'

// Multi-line input with an optional left icon column (Contact form style).
export default function Textarea({ icon: Icon, invalid = false, rows = 5, className, ref, ...rest }) {
  return (
    <div className="relative">
      {Icon && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex w-12 justify-center border-r border-line pt-3.5 text-muted"
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          fieldBase,
          'block resize-y px-4 py-3',
          Icon && 'pl-15',
          invalid && fieldInvalid,
          className,
        )}
        {...rest}
      />
    </div>
  )
}

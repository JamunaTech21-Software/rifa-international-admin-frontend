import { cn } from '@/lib/cn'
import { fieldBase, fieldInvalid, iconCell } from '@/lib/formStyles'

// Text input with an optional left icon cell. Pass `ref` straight through (react-hook-form register).
// readOnly inputs (e.g. auto-calculated Age) get a grey background.
export default function TextInput({ icon: Icon, invalid = false, type = 'text', className, ref, ...rest }) {
  return (
    <div className="relative">
      {Icon && (
        <span className={iconCell} aria-hidden="true">
          <Icon size={18} />
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          fieldBase,
          'h-12 px-4 read-only:bg-surface-2',
          Icon && 'pl-15',
          invalid && fieldInvalid,
          className,
        )}
        {...rest}
      />
    </div>
  )
}

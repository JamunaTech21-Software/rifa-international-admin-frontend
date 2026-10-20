import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fieldBase, fieldInvalid, iconCell } from '@/lib/formStyles'

/**
 * Native select. options: array of strings or { value, label }.
 * placeholder — shown greyed out while the value is empty.
 * className goes to the <select>; wrapperClassName to the element around it (for flex/grid sizing).
 */
export default function Select({
  options = [],
  placeholder,
  icon: Icon,
  invalid = false,
  className,
  wrapperClassName,
  ref,
  ...rest
}) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      {Icon && (
        <span className={iconCell} aria-hidden="true">
          <Icon size={18} />
        </span>
      )}
      <select
        ref={ref}
        className={cn(
          fieldBase,
          'h-12 appearance-none pr-10 pl-4 has-[option[value=""]:checked]:text-muted',
          Icon && 'pl-15',
          invalid && fieldInvalid,
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const { value, label } = typeof option === 'string' ? { value: option, label: option } : option
          return (
            <option key={value} value={value} className="text-ink">
              {label}
            </option>
          )
        })}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink"
        aria-hidden="true"
      />
    </div>
  )
}

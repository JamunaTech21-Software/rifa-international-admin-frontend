import { Children, cloneElement, isValidElement, useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * Label + control + hint + error. The single child control receives id, aria-describedby, aria-invalid,
 * aria-required and `invalid` automatically.
 * group — render a <fieldset>/<legend> (use for RadioGroup).
 */
export default function FormField({
  label,
  required = false,
  hint,
  error,
  group = false,
  id,
  className,
  children,
}) {
  const autoId = useId()
  const controlId = id ?? autoId
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const child = Children.only(children)
  const control = isValidElement(child)
    ? cloneElement(child, {
        id: controlId,
        invalid: Boolean(error),
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })
    : child

  const labelContent = (
    <>
      {label}
      {required && (
        <span className="ml-0.5 text-danger-600" aria-hidden="true">
          *
        </span>
      )}
    </>
  )

  const Wrapper = group ? 'fieldset' : 'div'
  const labelClass = 'mb-1.5 block text-[0.9375rem] font-semibold text-ink'

  return (
    <Wrapper className={cn('min-w-0', className)}>
      {label &&
        (group ? (
          <legend className={labelClass}>{labelContent}</legend>
        ) : (
          <label htmlFor={controlId} className={labelClass}>
            {labelContent}
          </label>
        ))}
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-danger-600">
          {error}
        </p>
      )}
    </Wrapper>
  )
}

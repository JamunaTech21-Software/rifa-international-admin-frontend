import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import Spinner from '@/components/ui/Spinner'

const variants = {
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800',
  outline: 'border-[1.5px] border-primary-600 bg-white text-primary-600 hover:bg-primary-50',
  white: 'bg-white text-primary-600 shadow-sm hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
  danger: 'bg-danger-600 text-white shadow-sm hover:bg-danger-600/90 active:bg-danger-600/80',
  dangerOutline: 'border-[1.5px] border-danger-600 bg-white text-danger-600 hover:bg-danger-50',
}

const sizes = {
  sm: 'h-9 gap-1.5 px-4 text-sm',
  md: 'h-12 gap-2 px-6 text-base',
  lg: 'h-14 gap-2.5 px-8 text-lg',
}

const iconSizes = { sm: 16, md: 18, lg: 22 }

/**
 * Renders a router <Link> when `to` is set, an <a> when `href` is set, otherwise a <button>.
 * iconRight: true → ArrowRight, or pass any lucide icon component. iconLeft: lucide icon component.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  to,
  href,
  iconLeft: IconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}) {
  const IconRight = iconRight === true ? ArrowRight : iconRight
  const iconSize = iconSizes[size]
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-60',
    shape === 'pill' ? 'rounded-full' : 'rounded-btn',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  )

  const content = (
    <>
      {loading ? <Spinner size="sm" /> : IconLeft && <IconLeft size={iconSize} aria-hidden="true" />}
      {children}
      {IconRight && !loading && <IconRight size={iconSize} aria-hidden="true" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  )
}

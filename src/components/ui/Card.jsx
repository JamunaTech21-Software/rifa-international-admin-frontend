import { cn } from '@/lib/cn'

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

const tints = {
  white: 'border-line bg-white',
  surface: 'border-line bg-surface',
  blue: 'border-transparent bg-tone-blue-50',
  green: 'border-transparent bg-tone-green-50',
  purple: 'border-transparent bg-tone-purple-50',
  orange: 'border-transparent bg-tone-orange-50',
  teal: 'border-transparent bg-tone-teal-50',
  red: 'border-transparent bg-tone-red-50',
}

// Rounded bordered container. `interactive` adds a hover lift for clickable cards.
export default function Card({
  as: Tag = 'div',
  tint = 'white',
  padding = 'md',
  shadow = true,
  interactive = false,
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'rounded-card border',
        tints[tint],
        paddings[padding],
        shadow && 'shadow-card',
        interactive && 'transition-shadow duration-200 hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

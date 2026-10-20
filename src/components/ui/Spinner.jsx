import { cn } from '@/lib/cn'

const sizes = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-10 border-[3px]' }

export default function Spinner({ size = 'md', label = 'Loading', className }) {
  return (
    <span role="status" aria-label={label} className={cn('inline-block', className)}>
      <span
        aria-hidden="true"
        className={cn('block animate-spin rounded-full border-current border-r-transparent', sizes[size])}
      />
    </span>
  )
}

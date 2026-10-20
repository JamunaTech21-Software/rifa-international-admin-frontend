import logoColor from '@/assets/brand/rifa-logo.webp'
import logoWhite from '@/assets/brand/rifa-logo-white.webp'
import { cn } from '@/lib/cn'

// Temporary raster logo cropped from the reference designs — swap the WebP files for the official SVG when available.
// The white logo only appears in the footer, far below the fold, so it loads lazily.
export default function Logo({ variant = 'color', className }) {
  const white = variant === 'white'
  return (
    <img
      src={white ? logoWhite : logoColor}
      alt="Rifa International"
      width={190}
      height={64}
      loading={white ? 'lazy' : undefined}
      decoding="async"
      className={cn('h-12 w-auto sm:h-14', className)}
    />
  )
}

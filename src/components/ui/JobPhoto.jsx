import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { cloudinaryUrl } from '@/lib/cloudinary'

/** Job photo thumbnail from a Cloudinary public ID (or a chosen file's preview URL); a grey box when there is none. */
export default function JobPhoto({ publicId, previewUrl, className }) {
  const src = previewUrl || cloudinaryUrl(publicId, 240)
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-surface-2 text-muted',
          className,
        )}
      >
        <ImageIcon size={20} />
      </span>
    )
  }
  return <img src={src} alt="" loading="lazy" className={cn('rounded-lg object-cover', className)} />
}

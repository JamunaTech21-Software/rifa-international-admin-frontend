import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import TextInput from '@/components/form/TextInput'

// Password field with a show/hide button. Receives the props FormField injects (id, aria-*, invalid) and passes
// them to the real <input>, so the label and error wiring still work.
export default function PasswordInput({ className, ...rest }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <TextInput type={visible ? 'text' : 'password'} className={`pr-12 ${className ?? ''}`} {...rest} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-lg text-muted hover:text-ink"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}

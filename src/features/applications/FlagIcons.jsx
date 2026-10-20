import { Copy, TriangleAlert } from 'lucide-react'

/**
 * Warning icons for an application: over 45 years old, and a possible duplicate. Each has a tooltip (title)
 * and a text label for screen readers. Shows a dash when there are no flags.
 */
export default function FlagIcons({ application }) {
  const flags = []
  if (application.is_age_flagged) {
    flags.push({
      key: 'age',
      label: 'Applicant is over 45',
      icon: TriangleAlert,
      tone: 'bg-warning-50 text-tone-orange',
    })
  }
  if (application.is_duplicate_flagged) {
    flags.push({
      key: 'dup',
      label: 'Possible duplicate application',
      icon: Copy,
      tone: 'bg-tone-purple-50 text-tone-purple',
    })
  }
  if (flags.length === 0)
    return (
      <span className="text-muted" aria-label="No flags">
        –
      </span>
    )

  return (
    <span className="inline-flex items-center gap-1.5">
      {flags.map(({ key, label, icon: Icon, tone }) => (
        <span
          key={key}
          title={label}
          className={`inline-flex size-7 items-center justify-center rounded-full ${tone}`}
        >
          <Icon size={15} aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </span>
      ))}
    </span>
  )
}

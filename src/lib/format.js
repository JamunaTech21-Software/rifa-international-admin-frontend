const DHAKA = 'Asia/Dhaka'

const numberFormat = new Intl.NumberFormat('en-US')

// "15 October 2026, 10:32 AM" in Bangladesh time.
export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.toLocaleDateString('en-GB', {
    timeZone: DHAKA,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('en-US', { timeZone: DHAKA, hour: 'numeric', minute: '2-digit' })
  return `${day}, ${time}`
}

// "15 Oct 2026, 10:32 AM" in Bangladesh time — compact version for tables.
export function formatDateTimeShort(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.toLocaleDateString('en-GB', {
    timeZone: DHAKA,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('en-US', { timeZone: DHAKA, hour: 'numeric', minute: '2-digit' })
  return `${day}, ${time}`
}

// "15 October 2026" in Bangladesh time.
export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { timeZone: DHAKA, day: 'numeric', month: 'long', year: 'numeric' })
}

// "10:32 AM" in Bangladesh time.
export function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-US', { timeZone: DHAKA, hour: 'numeric', minute: '2-digit' })
}

// formatRm(1800, 2200) → "RM 1,800 - 2,200"; formatRm(1800) → "RM 1,800"
export function formatRm(min, max) {
  if (min == null && max == null) return ''
  if (max == null || max === min) return `RM ${numberFormat.format(min ?? max)}`
  return `RM ${numberFormat.format(min)} - ${numberFormat.format(max)}`
}

// formatFileSize(1536000) → "1.5 MB"
export function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
}

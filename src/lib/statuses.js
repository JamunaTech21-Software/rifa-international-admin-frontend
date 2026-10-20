/**
 * Colours for application statuses (the 9 statuses from backend/docs/api.md). Full class names are written out
 * so Tailwind can see them: `badge` is the pill, `bar` the dashboard bar.
 */
export const statusStyles = {
  received: { badge: 'bg-tone-blue-50 text-tone-blue', bar: 'bg-tone-blue' },
  under_review: { badge: 'bg-primary-50 text-primary-700', bar: 'bg-primary-500' },
  shortlisted: { badge: 'bg-tone-green-50 text-tone-green', bar: 'bg-tone-green' },
  interview: { badge: 'bg-tone-purple-50 text-tone-purple', bar: 'bg-tone-purple' },
  medical: { badge: 'bg-tone-orange-50 text-tone-orange', bar: 'bg-tone-orange' },
  visa_processing: { badge: 'bg-tone-teal-50 text-tone-teal', bar: 'bg-tone-teal' },
  departed: { badge: 'bg-success-50 text-success-700', bar: 'bg-success-600' },
  on_hold: { badge: 'bg-warning-50 text-tone-orange', bar: 'bg-warning-500' },
  rejected: { badge: 'bg-danger-50 text-danger-600', bar: 'bg-danger-600' },
}

const fallback = { badge: 'bg-surface-2 text-ink', bar: 'bg-muted' }

export const statusStyle = (status) => statusStyles[status] ?? fallback

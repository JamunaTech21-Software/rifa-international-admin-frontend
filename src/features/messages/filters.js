/**
 * Filters of the messages inbox. Like the applications list, the URL is the single source of truth
 * (?q=…&status=…&subject=…&page=2). With no status the server returns everything except archived messages.
 */

export const PER_PAGE = 20

/** The four states of a contact message. */
export const messageStatusOptions = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
]

export const FILTER_KEYS = ['q', 'status', 'subject']

/** Reads the filters out of the URL; unknown values are ignored. subjectValues is null until the lookups load. */
export function readFilters(params, { subjectValues }) {
  const get = (key) => (params.get(key) ?? '').trim()
  const page = Number.parseInt(get('page'), 10)
  return {
    q: get('q'),
    status: messageStatusOptions.some((option) => option.value === get('status')) ? get('status') : '',
    subject: subjectValues === null || subjectValues.includes(get('subject')) ? get('subject') : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** Query string for the API list call. */
export function listQuery(filters) {
  const query = new URLSearchParams()
  FILTER_KEYS.forEach((key) => filters[key] && query.set(key, filters[key]))
  query.set('page', String(filters.page))
  query.set('per_page', String(PER_PAGE))
  return query.toString()
}

export const hasActiveFilters = (filters) => FILTER_KEYS.some((key) => Boolean(filters[key]))

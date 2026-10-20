/**
 * Filters of the news posts screen. The URL is the single source of truth (?q=…&status=scheduled).
 * The API returns every post at once (the list is small), newest first, so there is no paging.
 */

export const postStatusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
]

export const FILTER_KEYS = ['q', 'status']

/** Reads the filters out of the URL; unknown values are ignored. */
export function readFilters(params) {
  const get = (key) => (params.get(key) ?? '').trim()
  return {
    q: get('q'),
    status: postStatusOptions.some((option) => option.value === get('status')) ? get('status') : '',
  }
}

/** Query string for GET /admin/news. */
export function listQuery(filters) {
  const query = new URLSearchParams()
  FILTER_KEYS.forEach((key) => filters[key] && query.set(key, filters[key]))
  return query.toString()
}

export const hasActiveFilters = (filters) => FILTER_KEYS.some((key) => Boolean(filters[key]))

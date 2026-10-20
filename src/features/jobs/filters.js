/**
 * Filters of the job listings screen. The URL is the single source of truth (?q=…&status=draft&category=construction).
 * The API returns every job at once (the list is small), so there is no paging.
 */

export const jobStatusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

export const FILTER_KEYS = ['q', 'status', 'category']

/** Reads the filters out of the URL; unknown values are ignored. categoryValues is null until the lookups load. */
export function readFilters(params, { categoryValues }) {
  const get = (key) => (params.get(key) ?? '').trim()
  return {
    q: get('q'),
    status: jobStatusOptions.some((option) => option.value === get('status')) ? get('status') : '',
    category: categoryValues === null || categoryValues.includes(get('category')) ? get('category') : '',
  }
}

/** Query string for GET /admin/jobs. */
export function listQuery(filters) {
  const query = new URLSearchParams()
  FILTER_KEYS.forEach((key) => filters[key] && query.set(key, filters[key]))
  return query.toString()
}

export const hasActiveFilters = (filters) => FILTER_KEYS.some((key) => Boolean(filters[key]))

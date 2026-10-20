/**
 * Filters of the applications list. The URL is the single source of truth: every filter, the sort order and the
 * page live in the query string (?q=…&status=…&page=2), so a refresh, a shared link and the Back button all work.
 */

export const PER_PAGE = 20

export const passportOptions = [
  { value: 'have_passport', label: 'Have Passport' },
  { value: 'will_apply', label: 'Will Apply Soon' },
]

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const flagOptions = [
  { value: 'age', label: 'Over 45' },
  { value: 'duplicate', label: 'Possible duplicate' },
]

export const sortOptions = ['-created_at', 'created_at', 'full_name', '-full_name']

// Filters sent to the API as-is. (`page` and `sort` are handled separately.)
export const FILTER_KEYS = ['q', 'status', 'category', 'passport_status', 'gender', 'flag', 'from', 'to']

const oneOf = (value, options) => (options.some((option) => option.value === value) ? value : '')
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)

/**
 * Reads the filters out of the URL. Anything unknown (an old or hand-typed link) is ignored, so the list never
 * breaks on a bad value. statusValues / categoryValues are the allowed status and category values.
 */
export function readFilters(params, { statusValues, categoryValues }) {
  const get = (key) => (params.get(key) ?? '').trim()
  const sort = get('sort')
  const page = Number.parseInt(get('page'), 10)
  return {
    q: get('q'),
    status: statusValues.includes(get('status')) ? get('status') : '',
    // Categories load from the server; until they arrive keep what the URL says rather than dropping it.
    category: categoryValues === null || categoryValues.includes(get('category')) ? get('category') : '',
    passport_status: oneOf(get('passport_status'), passportOptions),
    gender: oneOf(get('gender'), genderOptions),
    flag: oneOf(get('flag'), flagOptions),
    from: isDate(get('from')) ? get('from') : '',
    to: isDate(get('to')) ? get('to') : '',
    sort: sortOptions.includes(sort) ? sort : '-created_at',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** Query string for the API list call (with paging and sort). */
export function listQuery(filters) {
  const query = new URLSearchParams()
  FILTER_KEYS.forEach((key) => filters[key] && query.set(key, filters[key]))
  query.set('sort', filters.sort)
  query.set('page', String(filters.page))
  query.set('per_page', String(PER_PAGE))
  return query.toString()
}

/** Query string for the CSV export: the same filters, without paging. */
export function exportQuery(filters) {
  const query = new URLSearchParams()
  FILTER_KEYS.forEach((key) => filters[key] && query.set(key, filters[key]))
  query.set('sort', filters.sort)
  return query.toString()
}

export const hasActiveFilters = (filters) => FILTER_KEYS.some((key) => Boolean(filters[key]))

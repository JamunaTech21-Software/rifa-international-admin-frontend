/**
 * Fetch wrapper for the admin API (backend/docs/api.md).
 *
 * - Base URL: VITE_API_BASE_URL (default "/api") + "/v1". Cookies are sent with every call (session login).
 * - A FormData body (photo uploads) is sent as multipart; anything else as JSON.
 * - Every non-GET call carries the X-CSRF-Token header (token from login or GET /admin/auth/me).
 * - 419 (CSRF mismatch): the token is refreshed from /admin/auth/me and the call is retried once.
 * - 401 on anything except the login call: the session ended, so the registered handler is told
 *   (AuthProvider uses it to send the user to /login?next=…).
 * - Errors become ApiError { status, code, message, fields, retryAfter }, including network failures (status 0).
 */

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/v1`

/** Full URL of an API path — for plain links such as the CSV export, where the browser sends the session cookie itself. */
export const apiUrl = (path) => `${API_BASE}${path}`

export class ApiError extends Error {
  constructor({
    status = 0,
    code = 'network_error',
    message = 'Something went wrong.',
    fields = {},
    retryAfter = null,
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
    this.retryAfter = retryAfter
  }
}

let csrfToken = ''
let onUnauthenticated = () => {}

export function setCsrfToken(token) {
  csrfToken = token ?? ''
}

/** Registers the function called when the server says the session is over (401). */
export function setUnauthenticatedHandler(handler) {
  onUnauthenticated = handler
}

async function send(method, path, json) {
  const headers = { Accept: 'application/json' }
  const isForm = json instanceof FormData // the browser sets the multipart boundary itself
  if (json !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: json === undefined ? undefined : isForm ? json : JSON.stringify(json),
      credentials: 'same-origin',
    })
  } catch {
    throw new ApiError({ status: 0, code: 'network_error', message: 'Could not reach the server.' })
  }

  if (response.status === 204) return { status: 204, payload: null }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // not JSON (for example a proxy error page) — handled below
  }
  return { status: response.status, ok: response.ok, payload, response }
}

async function request(method, path, json) {
  let result = await send(method, path, json)

  if (result.status === 419 && path !== '/admin/auth/me') {
    // The CSRF token went stale (for example after a login elsewhere): fetch a fresh one and retry once.
    const me = await send('GET', '/admin/auth/me')
    if (me.ok && me.payload?.data?.csrf_token) {
      setCsrfToken(me.payload.data.csrf_token)
      result = await send(method, path, json)
    }
  }

  if (result.status === 204) return null
  if (result.ok) return result.payload

  const error = result.payload?.error ?? {}
  const apiError = new ApiError({
    status: result.status,
    code: error.code ?? 'server_error',
    message: error.message ?? 'Something went wrong.',
    fields: error.fields ?? {},
    retryAfter: Number(result.response?.headers.get('Retry-After')) || null,
  })

  // Not for the login call (wrong password) nor the first-load session check ("not signed in yet" is normal).
  const sessionEnded =
    result.status === 401 && apiError.code !== 'invalid_credentials' && path !== '/admin/auth/me'
  if (sessionEnded) onUnauthenticated(apiError)
  throw apiError
}

export const apiGet = (path) => request('GET', path)
export const apiPost = (path, json) => request('POST', path, json ?? {})
/** POST a multipart form (FormData), e.g. a photo upload. */
export const apiPostForm = (path, form) => request('POST', path, form)
export const apiPatch = (path, json) => request('PATCH', path, json ?? {})
export const apiDelete = (path) => request('DELETE', path)

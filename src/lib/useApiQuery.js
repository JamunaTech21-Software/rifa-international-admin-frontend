import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

/**
 * Loads a GET endpoint and tracks its state.
 *
 * Returns { data, meta, loading, error, reload }:
 *   data / meta — the response's "data" and "meta" (null until loaded)
 *   loading     — true during the first load and while reloading
 *   error       — the ApiError of the last attempt (null when it worked)
 *   reload()    — fetch again (for a "Try again" button)
 * Pass path = null to wait (nothing is fetched). A new path starts a new load.
 */
export default function useApiQuery(path) {
  const [state, setState] = useState({ path, data: null, meta: null, error: null, done: false })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!path) return undefined
    let cancelled = false
    apiGet(path)
      .then(
        (response) =>
          !cancelled &&
          setState({ path, data: response.data, meta: response.meta ?? null, error: null, done: true }),
      )
      .catch((error) => !cancelled && setState({ path, data: null, meta: null, error, done: true }))
    return () => {
      cancelled = true
    }
  }, [path, attempt])

  // "loading" covers both the first load and a reload (state of an older path or attempt is not shown).
  const current = state.path === path
  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, done: false }))
    setAttempt((value) => value + 1)
  }, [])

  return {
    data: current ? state.data : null,
    meta: current ? state.meta : null,
    error: current ? state.error : null,
    loading: !current || !state.done,
    reload,
  }
}

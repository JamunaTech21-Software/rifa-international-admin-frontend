import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, apiGet, apiPost, setCsrfToken, setUnauthenticatedHandler } from '@/lib/api'

const AuthContext = createContext(null)

/**
 * Keeps the signed-in admin for the whole app.
 *
 * status: 'loading' (asking the server on first load) | 'authed' | 'anon'. expired / signedOut say why the
 * person is signed out (session ended vs. pressed Logout).
 * On load it calls GET /admin/auth/me; a 401 means "not signed in". Later, if any request gets a 401
 * (session expired, password changed elsewhere) the status flips to 'anon', and RequireAuth sends
 * the person to /login?next=<where they were>.
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', admin: null, expired: false, signedOut: false })

  const applySession = useCallback((data) => {
    setCsrfToken(data.csrf_token)
    setState({ status: 'authed', admin: data.admin, expired: false, signedOut: false })
  }, [])

  const clearSession = useCallback((expired = false, signedOut = false) => {
    setCsrfToken('')
    setState({ status: 'anon', admin: null, expired, signedOut })
  }, [])

  // First load: is there a valid session cookie?
  useEffect(() => {
    let cancelled = false
    apiGet('/admin/auth/me')
      .then((response) => !cancelled && applySession(response.data))
      .catch(() => !cancelled && clearSession(false))
    return () => {
      cancelled = true
    }
  }, [applySession, clearSession])

  // Any later 401 means the session is over.
  useEffect(() => {
    setUnauthenticatedHandler(() => clearSession(true))
    return () => setUnauthenticatedHandler(() => {})
  }, [clearSession])

  const login = useCallback(
    async (email, password) => {
      const response = await apiPost('/admin/auth/login', { email, password })
      applySession(response.data)
      return response.data.admin
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    try {
      await apiPost('/admin/auth/logout')
    } catch (error) {
      // Even if the server call fails (already expired, offline), leave the admin area locally.
      if (!(error instanceof ApiError)) throw error
    }
    clearSession(false, true) // a deliberate logout: no "?next=" on the login page
  }, [clearSession])

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

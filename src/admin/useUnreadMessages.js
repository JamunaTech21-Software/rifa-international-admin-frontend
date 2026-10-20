import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

const REFRESH_MS = 60_000

/**
 * Number of unread contact messages for the sidebar badge (GET /admin/messages meta.unread_count).
 * Refreshed every minute and whenever refreshKey changes (the layout passes the current path, so every
 * page change refreshes the badge and also notices an expired session straight away).
 */
export default function useUnreadMessages(refreshKey) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      apiGet('/admin/messages?per_page=1')
        .then((response) => !cancelled && setCount(response.meta?.unread_count ?? 0))
        .catch(() => {})
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [refreshKey])

  return count
}

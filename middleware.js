// Forwards /api/* to the PHP backend and tells it the visitor's real IP.
// The secret proves the request came through Vercel; browsers never see it.
// Needs the Vercel environment variables BACKEND_ORIGIN and TRUSTED_PROXY_SECRET
// (see ../../backend/docs/vercel-proxy.md). Only runs on Vercel, not in `npm run dev`.
import { ipAddress, rewrite } from '@vercel/functions'

export const config = { matcher: '/api/:path*' }

export default function middleware(request) {
  const url = new URL(request.url)
  const target = new URL(url.pathname + url.search, process.env.BACKEND_ORIGIN)

  const headers = new Headers(request.headers)
  headers.set('X-Rifa-Proxy-Secret', process.env.TRUSTED_PROXY_SECRET ?? '')
  headers.set('X-Rifa-Client-Ip', ipAddress(request) ?? '') // overwrites anything the browser sent

  return rewrite(target, { request: { headers } })
}

/**
 * Returns a safe in-app path from a ?next= value: it must start with a single "/" so a crafted link
 * cannot send an admin to another website after login. Anything else becomes "/".
 */
export function safeNext(value) {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/'
  const authPages = ['/login', '/forgot-password', '/reset-password']
  if (
    authPages.some((page) => value === page || value.startsWith(`${page}?`) || value.startsWith(`${page}/`))
  )
    return '/'
  return value
}

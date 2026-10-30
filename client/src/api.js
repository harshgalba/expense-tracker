import { getToken } from './auth'

// Calls our API with the login token and JSON handled for you.
//   api('/api/categories')                                        GET
//   api('/api/categories', { method: 'POST', body: { name } })   POST with JSON
// Returns the normal fetch Response, so callers still use res.ok and res.json().
export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // The server rejected our token (expired, or signed with an old secret):
  // log out and go to the login page. Only when a token was sent, so a
  // wrong password on the login form (also 401) is not affected.
  if (res.status === 401 && token) {
    localStorage.removeItem('token')
    window.location.assign('/login')
  }

  return res
}
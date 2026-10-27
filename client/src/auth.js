// Returns the stored JWT, or null if there is none or it has expired.
// An expired or broken token is removed, so the app treats the user as logged out.
// Note: this only READS the expiry for the UI. The server still verifies every token.
export function getToken() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    // JWT = header.payload.signature; the payload is base64url-encoded JSON
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json)

    // exp is in seconds, Date.now() in milliseconds
    if (exp * 1000 > Date.now()) return token
  } catch {
    // Not a valid JWT: fall through and remove it
  }

  localStorage.removeItem('token')
  return null
}
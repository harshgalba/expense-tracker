import { useState } from 'react'
import { useNavigate } from 'react-router'
export default function Register() {
  const [name, setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      navigate('/login')
    } catch {
      setError('Could not reach the server. Is the API running?')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
      <h1 className="text-2xl font-semibold">Register</h1>

        <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-400">Name</span>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Email</span>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Password</span>
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-400 disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  )
}
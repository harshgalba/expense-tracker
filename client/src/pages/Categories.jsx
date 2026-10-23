import { useEffect, useState } from 'react'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Load the categories once, when the page opens
  useEffect(() => {
    fetch('/api/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load categories')
        setCategories(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
      <h1 className="text-2xl font-semibold">Categories</h1>

      {loading && <p className="mt-6 text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="mt-6 divide-y divide-neutral-800 rounded-lg border border-neutral-800">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-5 py-3">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-neutral-500">
                {c.is_custom ? 'Custom' : 'Default'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
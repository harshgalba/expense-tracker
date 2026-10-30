import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Form fields
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Shown above the list when a delete fails
  const [deleteError, setDeleteError] = useState('')

  // Load the categories when the page opens, and again after a change
  useEffect(() => {
    setLoading(true)
    setError('')
    
    api('/api/categories')
      
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load categories')
        setCategories(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  async function handleAdd(e) {
    e.preventDefault()
    setSaveError('')
    setSaving(true)

    try {
      const res = await api('/api/categories', { method: 'POST', body: { name: newName } })
      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error || 'Could not add category')
        return
      }

      setNewName('')
      setRefreshKey((k) => k + 1)
    } catch {
      setSaveError('Could not reach the server')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category?')) return

    setDeleteError('')

    try {
      const res = await api(`/api/categories/${id}`, { method: 'DELETE' })
      
      // 204 means success and has no body, so don't parse JSON here
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error || 'Could not delete category')
        return
      }

      setRefreshKey((k) => k + 1)
    } catch {
      setDeleteError('Could not reach the server')
    }
  }

  return (
    <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <form onSubmit={handleAdd} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="text"
          required
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
        />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-400 disabled:opacity-50"
        >
          {saving ? 'Adding…' : 'Add'}
        </button>
      </form>
      {saveError && <p className="mt-3 text-sm text-red-400">{saveError}</p>}

      {loading && <p className="mt-6 text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}
      {deleteError && <p className="mt-6 text-sm text-red-400">{deleteError}</p>}

      {!loading && !error && (
        <ul className="mt-6 divide-y divide-neutral-800 rounded-lg border border-neutral-800">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-5 py-3">
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500">
                  {c.is_custom ? 'Custom' : 'Default'}
                </span>
                {c.is_custom && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-md px-2 py-2 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
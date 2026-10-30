import { useState } from 'react'
import { api } from '../api'

const inputClass = 'mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2'

// Category dropdown with a "+ New category…" option that creates one inline.
// Props:
//   categories  the list to show
//   value       the selected category id (as a string)
//   onChange    called with the new id (as a string)
//   onCreated   called with the new category object, so the parent can add it to its list
export default function CategorySelect({ categories, value, onChange, onCreated }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSelect(e) {
    if (e.target.value === '__new') {
      setAdding(true)
      setError('')
    } else {
      onChange(e.target.value)
    }
  }

  function cancel() {
    setAdding(false)
    setNewName('')
    setError('')
  }

  async function create() {
    if (newName.trim() === '') {
      setError('Enter a name')
      return
    }
    setError('')
    setSaving(true)

    try {
      const res = await api('/api/categories', { method: 'POST', body: { name: newName } })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Could not add category')
        return
      }

      onCreated(data)
      onChange(String(data.id))
      cancel()
    } catch {
      setError('Could not reach the server')
    } finally {
      setSaving(false)
    }
  }

  if (adding) {
    return (
      <div className="block">
        <span className="text-sm text-neutral-400">New category</span>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              // Enter would submit the surrounding form; create the category instead
              if (e.key === 'Enter') {
                e.preventDefault()
                create()
              }
              if (e.key === 'Escape') cancel()
            }}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2"
          />
          <button
            type="button"
            onClick={create}
            disabled={saving}
            className="shrink-0 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
          <button
            type="button"
            onClick={cancel}
            className="shrink-0 rounded-md border border-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <label className="block">
      <span className="text-sm text-neutral-400">Category</span>
      <select required value={value} onChange={handleSelect} className={inputClass}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value="__new">+ New category…</option>
      </select>
    </label>
  )
}
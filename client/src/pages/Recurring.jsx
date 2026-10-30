import { useEffect, useState } from 'react'
import CategorySelect from '../components/CategorySelect'
import { api } from '../api'
import { formatRupees } from '../format'

const inputClass = 'mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2'

export default function Recurring() {
  const [rules, setRules] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Form fields
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Shown above the list when pause/resume/delete fails
  const [actionError, setActionError] = useState('')

  // Load the categories once, for the dropdown
  useEffect(() => {
    api('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        if (data.length > 0) setCategoryId(String(data[0].id))
      })
      .catch(() => setError('Could not load categories'))
  }, [])

  // Load the rules when the page opens, and again after adding one
  useEffect(() => {
    api('/api/recurring')
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load recurring expenses')
        setRules(data)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError('')
    setSaving(true)

    try {
      const res = await api('/api/recurring', {
        method: 'POST',
        body: {
          amount: Number(amount),
          day_of_month: Number(dayOfMonth),
          category_id: Number(categoryId),
          note: note.trim() || null,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error || 'Could not save')
        return
      }

      setAmount('')
      setNote('')
      setRefreshKey((k) => k + 1)
    } catch {
      setSaveError('Could not reach the server')
    } finally {
      setSaving(false)
    }
  }
  
  async function toggleActive(rule) {
    setActionError('')
    try {
      const res = await api(`/api/recurring/${rule.id}`, {
        method: 'PATCH',
        body: { active: !rule.active },
      })
      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error || 'Could not update')
        return
      }
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Could not reach the server')
    }
  }

  async function deleteRule(id) {
    if (!window.confirm('Delete this recurring expense? Expenses it already added will stay.')) return

    setActionError('')
    try {
      const res = await api(`/api/recurring/${id}`, { method: 'DELETE' })
      // 204 means success and has no body, so don't parse JSON here
      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error || 'Could not delete')
        return
      }
      setRefreshKey((k) => k + 1)
    } catch {
      setActionError('Could not reach the server')
    }
  }
  return (
    <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
      <h1 className="text-2xl font-semibold">Recurring</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-400">
        Expenses that repeat every month. They're added to your expenses automatically on their day,
        starting from the next time that day comes around. Day 29–31 uses the last day in shorter months.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-lg border border-neutral-800 p-5 sm:grid-cols-2"
      >
        <p className="text-sm font-medium sm:col-span-2">Add a monthly expense</p>

        <label className="block">
          <span className="text-sm text-neutral-400">Amount (₹)</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Day of the month</span>
          <input
            type="number"
            min="1"
            max="31"
            required
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className={inputClass}
          />
        </label>

        <CategorySelect
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          onCreated={(cat) => setCategories((list) => [...list, cat])}
        />

        <label className="block">
          <span className="text-sm text-neutral-400">Note (optional)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add recurring expense'}
          </button>
        </div>
        {saveError && <p className="text-sm text-red-400 sm:col-span-2">{saveError}</p>}
      </form>

      {loading && <p className="mt-6 text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}
      {actionError && <p className="mt-6 text-sm text-red-400">{actionError}</p>}
      {!loading && !error && rules.length === 0 && (
        <p className="mt-6 text-neutral-400">No recurring expenses yet.</p>
      )}

      {!loading && !error && rules.length > 0 && (
        <ul className="mt-6 divide-y divide-neutral-800 rounded-lg border border-neutral-800">
          {rules.map((r) => (
            <li key={r.id} className={`flex items-center justify-between gap-4 px-5 py-3 ${r.active ? '' : 'opacity-50'}`}>
              <div className="min-w-0">
                <p className="font-medium">
                  {r.category}
                  {r.note ? <span className="text-neutral-400"> · {r.note}</span> : null}
                </p>
                <p className="text-sm text-neutral-400">
                  Every month on day {r.day_of_month} · since {r.starts_on}
                  {!r.active && ' · paused'}
                </p>
              </div>
                <div className="flex shrink-0 items-center gap-2">
                <p className="font-medium">{formatRupees(r.amount)}</p>
                <button
                  onClick={() => toggleActive(r)}
                  className="rounded-md px-2 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                >
                  {r.active ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => deleteRule(r.id)}
                  className="rounded-md px-2 py-2 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

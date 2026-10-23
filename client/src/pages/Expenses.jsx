import { useEffect, useState } from 'react'

function pad(n) {
  return String(n).padStart(2, '0')
}

// The current month as "YYYY-MM", in your local time zone
function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}

// Today as "YYYY-MM-DD", in your local time zone
function today() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const inputClass = 'mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2'

export default function Expenses() {
  const [month, setMonth] = useState(currentMonth)
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Form fields
  const [amount, setAmount] = useState('')
  const [spentOn, setSpentOn] = useState(today)
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Shown above the list when a delete fails
  const [deleteError, setDeleteError] = useState('')

  // Load the categories once, when the page opens
  useEffect(() => {
    fetch('/api/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        if (data.length > 0) setCategoryId(String(data[0].id))
      })
      .catch(() => setError('Could not load categories'))
  }, [])

  // Load the expenses when the month changes, or after a save or delete
  useEffect(() => {
    setLoading(true)
    setError('')

    fetch(`/api/expenses?month=${month}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load expenses')
        setExpenses(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [month, refreshKey])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError('')
    setSaving(true)

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          spent_on: spentOn,
          category_id: Number(categoryId),
          note: note.trim() || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error || 'Could not save expense')
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

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return

    setDeleteError('')

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      // 204 means success and has no body, so don't parse JSON here
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error || 'Could not delete expense')
        return
      }

      setRefreshKey((k) => k + 1)
    } catch {
      setDeleteError('Could not reach the server')
    }
  }

  return (
    <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-lg border border-neutral-800 p-5 sm:grid-cols-2"
      >
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
          <span className="text-sm text-neutral-400">Date</span>
          <input
            type="date"
            required
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Category</span>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

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
            {saving ? 'Saving…' : 'Add expense'}
          </button>
          {saveError && <p className="mt-3 text-sm text-red-400">{saveError}</p>}
        </div>
      </form>

      {loading && <p className="mt-6 text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}
      {deleteError && <p className="mt-6 text-sm text-red-400">{deleteError}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="mt-6 text-neutral-400">No expenses this month.</p>
      )}

      {!loading && !error && expenses.length > 0 && (
        <ul className="mt-6 divide-y divide-neutral-800">
          {expenses.map((exp) => (
            <li key={exp.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{exp.category}</p>
                <p className="text-sm text-neutral-400">
                  {exp.spent_on}
                  {exp.note ? ` · ${exp.note}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium">₹{Number(exp.amount).toFixed(2)}</p>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-sm text-red-400 hover:text-red-300"
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
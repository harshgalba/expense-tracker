import { useEffect, useState } from 'react'

// The current month as "YYYY-MM", in your local time zone
function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function Expenses() {
  const [month, setMonth] = useState(currentMonth)
  const [expenses, setExpenses] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Runs again every time the month changes
  useEffect(() => {
    const token = localStorage.getItem('token')
    setLoading(true)
    setError('')

    fetch(`/api/expenses?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load expenses')
        setExpenses(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [month])

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

      {loading && <p className="mt-6 text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}

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
              <p className="font-medium">₹{Number(exp.amount).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
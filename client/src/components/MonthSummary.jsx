import { useEffect, useState } from 'react'
import { api } from '../api'

export default function MonthSummary({ month, refreshKey }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  // Runs when the month changes, or after a save or delete
  useEffect(() => {
    setError('')

    api(`/api/expenses/summary?month=${month}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load summary')
        setSummary(data)
      })
      .catch((err) => setError(err.message))
  }, [month, refreshKey])

  if (error) return <p className="mt-6 text-sm text-red-400">{error}</p>
  if (!summary) return null

  return (
    <section className="mt-6 rounded-lg border border-neutral-800 p-5">
      <p className="text-sm text-neutral-400">Total this month</p>
      <p className="mt-1 text-3xl font-bold">₹{Number(summary.total).toFixed(2)}</p>

      {summary.byCategory.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {summary.byCategory.map((row) => (
            <li key={row.category_id} className="flex justify-between">
              <span className="text-neutral-400">{row.category}</span>
              <span className="font-medium">₹{Number(row.total).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
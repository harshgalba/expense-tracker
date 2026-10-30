import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { getToken } from '../auth'
import { api } from '../api'
import { formatRupees } from '../format'

// 'YYYY-MM' for today, in the user's local time zone
function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function ThisMonth({ dataVersion }) {
  const location = useLocation()
  const [summary, setSummary] = useState(null)
  const token = getToken()

  // Reload when the token changes (log in / out) or the page changes
  useEffect(() => {
    if (!token) return

    api(`/api/expenses/summary?month=${currentMonth()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
  }, [token, location.pathname, dataVersion])

  return (
    <aside className="hidden w-56 shrink-0 py-10 pr-6 xl:block">
      <p className="mb-3 text-sm font-semibold">This month</p>

      {token && summary ? (
        <dl className="space-y-2 text-sm text-neutral-400">
          <div className="flex justify-between">
            <dt>Spent</dt>
            <dd className="font-medium text-neutral-100">
              {formatRupees(summary.total)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Expenses</dt>
            <dd className="font-medium text-neutral-100">{summary.count}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-neutral-400">Log in to see your totals.</p>
      )}
    </aside>
  )
}
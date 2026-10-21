import { useEffect, useState } from 'react'
// 1. Data for the sidebar. Keeping it in an array means adding
//    a page later is one line, not a copy-pasted block of JSX.
const navGroups = [
  {
    title: 'Overview',
    links: ['Dashboard'],
  },
  {
    title: 'Money',
    links: ['Expenses', 'Categories', 'Recurring'],
  },
]

function App() {
    // 'checking' → 'online' or 'offline'
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('API error')
        setApiStatus('online')
      })
      .catch(() => setApiStatus('offline'))
  }, [])
  return (
    <div className="min-h-screen bg-[#111] text-neutral-100">
      {/* 2. Top bar: stays at the top while you scroll */}
      <header className="sticky top-0 z-10 h-16 border-b border-neutral-800 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <a href="/" className="text-lg font-bold">
            Expense Tracker
          </a>
          <nav className="flex gap-6 text-sm text-neutral-400">
            <span className={apiStatus === 'online' ? 'text-green-400' : 'text-red-400'}>API: {apiStatus}</span>
            <a href="#" className="hover:text-neutral-100">Log in</a>
            <a href="#" className="hover:text-neutral-100">Register</a>
          </nav>
        </div>
      </header>

      {/* 3. Three columns: sidebar | content | "this month" */}
      <div className="mx-auto flex max-w-7xl">
        {/* Left sidebar: hidden on phones, shown from tablet width up */}
        <aside className="hidden w-64 shrink-0 border-r border-neutral-800 px-6 py-8 md:block">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="block rounded-md px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Middle: the main page content */}
        <main className="min-w-0 flex-1 px-6 py-10 md:px-12">
          <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-4 max-w-2xl leading-7 text-neutral-400">
            Log your expenses, mark the ones that repeat every month, and see
            where your money actually goes.
          </p>

          <h2 className="mt-10 border-b border-neutral-800 pb-2 text-2xl font-semibold">
            Getting started
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-neutral-800 p-5">
              <h3 className="font-semibold">Add an expense</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Amount, category, date — that's it.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-800 p-5">
              <h3 className="font-semibold">Check your summary</h3>
              <p className="mt-1 text-sm text-neutral-400">
                See your spending by category for any month.
              </p>
            </div>
          </div>
        </main>

        {/* Right column: only on wide screens */}
        <aside className="hidden w-56 shrink-0 py-10 pr-6 xl:block">
          <p className="mb-3 text-sm font-semibold">This month</p>
          <dl className="space-y-2 text-sm text-neutral-400">
            <div className="flex justify-between">
              <dt>Spent</dt>
              <dd className="font-medium text-neutral-100">₹0</dd>
            </div>
            <div className="flex justify-between">
              <dt>Expenses</dt>
              <dd className="font-medium text-neutral-100">0</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}

export default App

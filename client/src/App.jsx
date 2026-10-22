import { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Expenses from './pages/Expenses'
import Categories from './pages/Categories'
import Recurring from './pages/Recurring'
import Login from './pages/Login'

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
      <Header apiStatus={apiStatus} />
      {/* 3. Three columns: sidebar | content | "this month" */}
      <div className="mx-auto flex max-w-7xl">
        {/* Left sidebar: hidden on phones, shown from tablet width up */}
      <Sidebar/>
        {/* Middle: the main page content */}

        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/recurring" element={<Recurring />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>

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

import { useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Expenses from './pages/Expenses'
import Categories from './pages/Categories'
import Recurring from './pages/Recurring'
import Login from './pages/Login'
import Register from './pages/Register'
import RequireAuth from './components/RequireAuth'
import ThisMonth from './components/ThisMonth'

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/expenses" element={<RequireAuth><Expenses /></RequireAuth>} />
            <Route path="/categories" element={<RequireAuth><Categories /></RequireAuth>} />
            <Route path="/recurring" element={<RequireAuth><Recurring /></RequireAuth>} />
          </Routes>
        </div>

        {/* Right column: only on wide screens */}
        <ThisMonth/>
      </div>
    </div>
  )
}

export default App

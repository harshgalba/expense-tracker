import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import NavLinks from './NavLinks'
import { getToken } from '../auth'

function Header({ apiStatus }) {
  // Rerenders the header on every page change, so the login state stays current
  useLocation()
  const navigate = useNavigate()
  const loggedIn = Boolean(getToken())
  const [menuOpen, setMenuOpen] = useState(false)

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // While the drawer is open, Esc closes it
  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    // Cleanup: runs when the drawer closes or the header unmounts
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-10 h-16 border-b border-neutral-800 bg-[#111]/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger: phones only */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-md p-2 text-neutral-300 hover:bg-neutral-800 md:hidden"
            >
              ☰
            </button>
            <Link to="/" className="text-lg font-bold">
              Expense Tracker
            </Link>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm text-neutral-400">
            <span className={`hidden sm:inline ${apiStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>API: {apiStatus}</span>
            {loggedIn ? (
              <button onClick={logout} className="hover:text-neutral-100">
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-neutral-100">Log in</Link>
                <Link to="/register" className="hover:text-neutral-100">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Phone drawer: outside <header> so backdrop-blur doesn't trap it */}
      {menuOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-neutral-800 bg-[#111] px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-2 text-neutral-300 hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>
            <NavLinks onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}

export default Header
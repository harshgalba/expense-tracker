import { Link, useLocation, useNavigate } from 'react-router'

function Header({ apiStatus }) {
  // Rerenders the header on every page change, so the login state stays current
  useLocation()
  const navigate = useNavigate()
  const loggedIn = Boolean(localStorage.getItem('token'))

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 h-16 border-b border-neutral-800 bg-[#111]/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <a href="/" className="text-lg font-bold">
          Expense Tracker
        </a>
        <nav className="flex gap-6 text-sm text-neutral-400">
          <span className={apiStatus === 'online' ? 'text-green-400' : 'text-red-400'}>API: {apiStatus}</span>
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
  )
}

export default Header
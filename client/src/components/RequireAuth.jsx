import { Navigate } from 'react-router'

function RequireAuth({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth
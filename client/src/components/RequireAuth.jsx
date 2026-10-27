import { Navigate } from 'react-router'
import { getToken } from '../auth'

function RequireAuth({ children }) {
  const token = getToken()
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth
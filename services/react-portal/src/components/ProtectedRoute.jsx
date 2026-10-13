// ROUTER — protected (guarded) route. A layout route with no path: if the user has no JWT
// we <Navigate> to /login and remember where they wanted to go in location.state.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../store/authSlice.js'

export default function ProtectedRoute() {
  const loggedIn = useSelector(selectIsLoggedIn)
  const location = useLocation()
  if (!loggedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

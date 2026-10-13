// ROUTER — catch-all `*` route.
import { Link, useLocation } from 'react-router-dom'

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <div className="container page narrow center">
      <p className="big-404">404</p>
      <h1>Page not found</h1>
      <p className="muted">
        There is nothing at <code>{pathname}</code>.
      </p>
      <div className="btn-row center">
        <Link className="btn btn-primary" to="/">Go to dashboard</Link>
        <Link className="btn btn-outline" to="/machines">See machines</Link>
      </div>
    </div>
  )
}

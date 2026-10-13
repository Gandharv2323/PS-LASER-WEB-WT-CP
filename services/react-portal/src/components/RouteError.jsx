// ROUTER — errorElement. Rendered when a loader throws (e.g. unknown machine slug -> 404).
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

export default function RouteError() {
  const error = useRouteError()
  const is404 = isRouteErrorResponse(error) && error.status === 404
  return (
    <section className="container page">
      <h1>{is404 ? 'Not found' : 'Something went wrong'}</h1>
      <p className="muted">
        {is404 ? error.data || 'We could not find that page.' : error?.statusText || error?.message || 'Unexpected error.'}
      </p>
      <Link className="btn btn-primary" to="/machines">Back to machines</Link>
    </section>
  )
}

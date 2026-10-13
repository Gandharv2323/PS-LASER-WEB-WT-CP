// Protected page (wrapped by <ProtectedRoute/>): fetches the customer's quotes with the JWT.
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getMyQuotes } from '../lib/api.js'
import { logout, selectToken, selectUser } from '../store/authSlice.js'
import OfflineBadge from '../components/OfflineBadge.jsx'
import { toast } from '../flux/ToastActions.js'
import { inr } from '../lib/config.js'

export default function MyQuotes() {
  const token = useSelector(selectToken)
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, quotes: [], source: null })

  useEffect(() => {
    let active = true
    getMyQuotes(token)
      .then(({ data, source }) => active && setState({ loading: false, quotes: data, source }))
      .catch((err) => {
        if (!active) return
        if (err.status === 401 || err.status === 403) {
          dispatch(logout())
          toast.warning('Your session expired — please sign in again.')
          navigate('/login', { replace: true, state: { from: '/my-quotes' } })
        } else {
          setState({ loading: false, quotes: [], source: null, error: err.message })
        }
      })
    return () => {
      active = false
    }
  }, [token, dispatch, navigate])

  return (
    <div className="container page">
      <h1>My quotes</h1>
      <p className="muted">
        Signed in as {user?.email} ({user?.role ?? 'customer'})
        {user?.offlineDemo && <span className="tag tag-warning">offline demo session</span>}
      </p>
      <OfflineBadge show={state.source === 'mock'} what="quote list" />
      {state.loading && <p className="muted">Loading your quotes…</p>}
      {state.error && <p className="alert alert-danger">{state.error}</p>}
      {!state.loading && !state.error && state.quotes.length === 0 && (
        <p className="panel">No saved quotes yet. Submit an enquiry from your quote cart and it will appear here.</p>
      )}
      {state.quotes.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Quote</th>
                <th scope="col">Material</th>
                <th scope="col" className="num">Qty</th>
                <th scope="col" className="num">Total</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.quotes.map((q) => (
                <tr key={q.quoteNo}>
                  <td>{q.quoteNo}</td>
                  <td>{q.materialCode} {q.thicknessMm} mm</td>
                  <td className="num">{q.quantity}</td>
                  <td className="num">{q.total != null ? inr(q.total) : '—'}</td>
                  <td><span className="tag">{q.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Order tracking — lazy-loaded route (React Router `lazy`), keyboard events (Escape clears),
// list rendering of the status timeline with keys.
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { trackOrder } from '../lib/api.js'
import OfflineBadge from '../components/OfflineBadge.jsx'
import { toast } from '../flux/ToastActions.js'
import { whatsappUrl } from '../lib/config.js'

const STEPS = ['received', 'cutting', 'bending', 'welding', 'coating', 'inspection', 'dispatched']

export default function Track() {
  const [params] = useSearchParams()
  const [orderNo, setOrderNo] = useState(params.get('orderNo') ?? '')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null) // { data, source } | { notFound: true }
  const [loading, setLoading] = useState(false)
  const orderRef = useRef(null)

  const clear = () => {
    setOrderNo('')
    setPhone('')
    setResult(null)
    orderRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // Enter in either input submits the form
    if (!orderNo.trim() || !/^\d{10}$/.test(phone.trim())) {
      toast.warning('Enter the order number and the 10-digit phone used for the order.')
      return
    }
    setLoading(true)
    try {
      const res = await trackOrder(orderNo.trim(), phone.trim())
      setResult(res.data ? res : { notFound: true, source: res.source })
    } catch (err) {
      setResult({ notFound: true, message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const order = result?.data
  const current = order ? STEPS.indexOf(order.status) : -1

  return (
    <div className="container page narrow">
      <h1>Track your order</h1>
      <form className="panel" onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Escape' && clear()}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="t-order">Order number</label>
            <input id="t-order" ref={orderRef} className="form-control" value={orderNo} onChange={(e) => setOrderNo(e.target.value.toUpperCase())} placeholder="PSL-DEMO-001" />
          </div>
          <div className="field">
            <label htmlFor="t-phone">Phone</label>
            <input id="t-phone" className="form-control" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9000000001" />
          </div>
        </div>
        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Checking…' : 'Track'}</button>
          <button type="button" className="btn btn-outline" onClick={clear}>Clear (Esc)</button>
        </div>
        <p className="muted mt-s">Demo order: PSL-DEMO-001 with phone 9000000001.</p>
      </form>

      {result?.notFound && (
        <div className="alert alert-warning mt">
          <p>{result.message ?? 'No order matches that number and phone.'}</p>
          <OfflineBadge show={result.source === 'mock'} what="lookup" />
          <a className="btn btn-whatsapp" href={whatsappUrl(`Hi PS Laser, what is the status of my order ${orderNo}?`)} target="_blank" rel="noreferrer">Ask on WhatsApp</a>
        </div>
      )}

      {order && (
        <section className="panel mt">
          <OfflineBadge show={result.source === 'mock'} what="order" />
          <h2>{order.orderNo}</h2>
          <p>{order.description} · {order.quantity} pcs</p>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''}>{s}</li>
            ))}
          </ol>
          <h3>History</h3>
          <ul className="timeline">
            {order.events.map((ev, i) => (
              // prefer the database id as key; offline demo events have none, so fall back to status+index
              <li key={ev.id ?? `${ev.status}-${i}`}>
                <strong>{ev.status}</strong> {ev.note && <>— {ev.note}</>}
                {ev.createdAt && <small className="muted"> · {new Date(ev.createdAt).toLocaleString('en-IN')}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// Quote cart — Redux Toolkit hooks (useSelector / useDispatch), lists with keys, a controlled
// enquiry form plus an UNCONTROLLED file input read through a ref (file inputs are always
// uncontrolled in React because their value is read-only).
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, removeItem, selectCartItems, selectEstimateTotal, updateQty } from '../store/cartSlice.js'
import { selectUser } from '../store/authSlice.js'
import TextField from '../components/TextField.jsx'
import { postEnquiry, saveQuote } from '../lib/api.js'
import { toast } from '../flux/ToastActions.js'
import { ESTIMATE_NOTE, inr, whatsappUrl } from '../lib/config.js'
import { composeCartMessage } from '../lib/cartMessage.js'

const ALLOWED = ['dxf', 'dwg', 'pdf', 'png', 'jpg', 'jpeg']
const MAX_BYTES = 10 * 1024 * 1024

export default function Cart() {
  const items = useSelector(selectCartItems)
  const total = useSelector(selectEstimateTotal)
  const user = useSelector(selectUser)
  const dispatch = useDispatch()

  const [form, setForm] = useState({ name: user?.name ?? '', phone: '', email: user?.email ?? '', message: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(null)
  const fileRef = useRef(null) // uncontrolled <input type="file">

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (form.name.trim().length < 2) errs.name = 'Please enter your name.'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) errs.phone = 'Enter a 10-digit Indian mobile number.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid e-mail or leave it blank.'
    const file = fileRef.current?.files?.[0]
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!ALLOWED.includes(ext)) errs.drawing = `Drawing must be one of: ${ALLOWED.join(', ')}.`
      else if (file.size > MAX_BYTES) errs.drawing = 'Drawing must be 10 MB or smaller.'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    const phone = form.phone.replace(/\D/g, '').slice(-10)
    const message = `${form.message ? `${form.message}\n\n` : ''}${composeCartMessage(items, total)}`
    const machine = items.find((i) => i.kind === 'machine')
    const service = items.find((i) => i.kind === 'service')
    const file = fileRef.current?.files?.[0]

    let payload = { name: form.name.trim(), phone, email: form.email || undefined, message, machineSlug: machine?.ref, serviceSlug: service?.ref, source: 'react-portal' }
    if (file) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => v !== undefined && fd.append(k, v))
      fd.append('drawing', file)
      payload = fd
    }

    setSending(true)
    try {
      const res = await postEnquiry(payload)
      // Also save each estimate as a quote in Spring Boot so it shows under "My quotes".
      const estimates = items.filter((i) => i.kind === 'estimate' && i.input)
      const saved = await Promise.allSettled(
        estimates.map((i) => saveQuote({ ...i.input, customerName: form.name.trim(), customerPhone: phone })),
      )
      const quoteNos = saved.filter((s) => s.status === 'fulfilled').map((s) => s.value?.quoteNo).filter(Boolean)
      setSent({ id: res?.id, whatsappUrl: res?.whatsappUrl, quoteNos })
      toast.success(`Enquiry #${res?.id ?? ''} sent to PS Laser`)
      dispatch(clearCart())
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors)
      toast.error(err.offline ? 'Enquiry server (Node :4000) is offline — nothing was sent. Please use “Send all on WhatsApp”.' : err.message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="container page">
        <div className="alert alert-success">
          <h1>Thank you!</h1>
          <p>Your enquiry {sent.id ? <strong>#{sent.id}</strong> : null} reached PS Laser. We usually reply on WhatsApp.</p>
          {sent.quoteNos.length > 0 && <p>Saved quotes: {sent.quoteNos.join(', ')}</p>}
          <div className="btn-row">
            {sent.whatsappUrl && <a className="btn btn-whatsapp" href={sent.whatsappUrl} target="_blank" rel="noreferrer">Follow up on WhatsApp</a>}
            <Link className="btn btn-outline" to="/machines">Back to machines</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1>Quote cart</h1>
      {items.length === 0 ? (
        <div className="panel">
          <p>Your quote cart is empty.</p>
          <div className="btn-row">
            <Link className="btn btn-primary" to="/machines">Browse machines</Link>
            <Link className="btn btn-outline" to="/estimate">Make an estimate</Link>
          </div>
        </div>
      ) : (
        <div className="estimate-layout">
          <section className="panel">
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-line">
                  <div>
                    <span className={`tag tag-${item.kind}`}>{item.kind}</span>
                    <strong>{item.title}</strong>
                    <p className="muted">
                      {item.detail}
                      {item.estimate && <> · est. {inr(item.estimate.total)}</>}
                      {item.offline && <span className="tag tag-warning">offline demo calc</span>}
                    </p>
                  </div>
                  <div className="cart-line__controls">
                    {item.kind !== 'estimate' && (
                      <label>
                        <span className="sr-only">Quantity for {item.title}</span>
                        <input
                          type="number"
                          min="1"
                          className="form-control qty"
                          value={item.qty}
                          onChange={(e) => dispatch(updateQty({ id: item.id, qty: e.target.value }))}
                        />
                      </label>
                    )}
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => dispatch(removeItem(item.id))} aria-label={`Remove ${item.title}`}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {total > 0 && (
              <p className="cart-total">
                Estimates total: <strong>{inr(total)}</strong>
                <br />
                <small>{ESTIMATE_NOTE}</small>
              </p>
            )}
            <div className="btn-row">
              <a className="btn btn-whatsapp" href={whatsappUrl(composeCartMessage(items, total))} target="_blank" rel="noreferrer">
                Send all on WhatsApp
              </a>
              <button type="button" className="btn btn-link" onClick={() => dispatch(clearCart())}>Clear cart</button>
            </div>
          </section>

          <form className="panel" onSubmit={handleSubmit} noValidate>
            <h2>Submit enquiry</h2>
            <p className="muted">Sends the whole cart to PS Laser (Node enquiry API) and saves each estimate as a quote.</p>
            <TextField label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} autoComplete="name" />
            <TextField label="Mobile" name="phone" value={form.phone} onChange={onChange} error={errors.phone} inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" />
            <TextField label="E-mail (optional)" name="email" value={form.email} onChange={onChange} error={errors.email} type="email" autoComplete="email" />
            <div className="field">
              <label htmlFor="enq-msg">Message (optional)</label>
              <textarea id="enq-msg" name="message" className="form-control" rows="3" value={form.message} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="enq-file">Drawing (DXF, DWG, PDF, PNG, JPG · max 10 MB)</label>
              <input id="enq-file" ref={fileRef} type="file" accept=".dxf,.dwg,.pdf,.png,.jpg,.jpeg" className="form-control" />
              {errors.drawing && <p className="field-error">{errors.drawing}</p>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Submit enquiry'}</button>
          </form>
        </div>
      )}
    </div>
  )
}

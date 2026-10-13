// CONTROLLED FORM with live validation (errors shown after a field is touched) and
// server-side field errors from Spring Boot merged into the same error map.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '../components/TextField.jsx'
import { registerUser } from '../store/authSlice.js'
import { toast } from '../flux/ToastActions.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Name must have at least 2 characters.'
  if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid e-mail address.'
  if (!/^[6-9]\d{9}$/.test(v.phone)) e.phone = 'Enter a 10-digit Indian mobile number.'
  if (v.password.length < 8) e.password = 'Use at least 8 characters.'
  else if (!/\d/.test(v.password) || !/[A-Za-z]/.test(v.password)) e.password = 'Mix letters and numbers.'
  if (v.confirm !== v.password) e.confirm = 'Passwords do not match.'
  return e
}

export default function Register() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const status = useSelector((s) => s.auth.status)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const errors = { ...validate(values), ...serverErrors } // derived from state on every render
  const show = (k) => (touched[k] ? errors[k] : undefined)

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value }))
    setServerErrors((s) => ({ ...s, [name]: undefined }))
  }
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true })
    if (Object.values(validate(values)).some(Boolean)) return
    try {
      const { name, email, phone, password } = values
      await dispatch(registerUser({ name: name.trim(), email: email.trim(), phone, password })).unwrap()
      toast.success('Account created — welcome to PS Laser!')
      navigate('/my-quotes')
    } catch (err) {
      if (err.fieldErrors) setServerErrors(err.fieldErrors)
      toast.error(err.message)
    }
  }

  const props = (name) => ({ name, value: values[name], onChange, onBlur, error: show(name) })

  return (
    <div className="container page narrow">
      <h1>Create account</h1>
      <form className="panel" onSubmit={handleSubmit} noValidate>
        <TextField label="Full name" autoComplete="name" {...props('name')} />
        <TextField label="E-mail" type="email" autoComplete="email" {...props('email')} />
        <TextField label="Mobile" inputMode="numeric" autoComplete="tel" hint="Used to match your quotes and orders" {...props('phone')} />
        <TextField label="Password" type="password" autoComplete="new-password" {...props('password')} />
        <TextField label="Confirm password" type="password" autoComplete="new-password" {...props('confirm')} />
        <button type="submit" className="btn btn-primary btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating…' : 'Create account'}
        </button>
        <p className="muted mt-s">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}

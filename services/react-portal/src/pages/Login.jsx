// UNCONTROLLED FORM with refs: the DOM keeps the input values; we read them through
// useRef only when the form is submitted. Also shows focus management (email box focused
// on mount, password re-focused and selected after a failed login).
import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearAuthError, loginUser, startOfflineDemo } from '../store/authSlice.js'
import { toast } from '../flux/ToastActions.js'

export default function Login() {
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useSelector((s) => s.auth)
  const from = location.state?.from ?? '/my-quotes'

  useEffect(() => {
    emailRef.current?.focus()
    return () => {
      dispatch(clearAuthError())
    }
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = emailRef.current.value.trim()
    const password = passwordRef.current.value
    if (!email || !password) {
      toast.warning('Enter your e-mail and password.')
      ;(email ? passwordRef : emailRef).current.focus()
      return
    }
    // dispatch(thunk) returns a promise; .unwrap() throws the rejectWithValue payload.
    try {
      const res = await dispatch(loginUser({ email, password })).unwrap()
      toast.success(`Signed in as ${res.user?.name ?? email}`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
      passwordRef.current.select()
      passwordRef.current.focus()
    }
  }

  return (
    <div className="container page narrow">
      <h1>Login</h1>
      {location.state?.from && <p className="alert alert-info">Please sign in to open {location.state.from}.</p>}
      <form className="panel" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-email">E-mail</label>
          {/* defaultValue (not value) => uncontrolled input */}
          <input id="login-email" ref={emailRef} type="email" name="email" className="form-control" autoComplete="username" defaultValue="" />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" ref={passwordRef} type="password" name="password" className="form-control" autoComplete="current-password" />
        </div>
        {error && <p className="field-error" role="alert">{error.message}</p>}
        {error?.offline && (
          <button
            type="button"
            className="btn btn-outline btn-block mb-s"
            onClick={() => {
              dispatch(startOfflineDemo())
              toast.warning('Offline demo session — no real account, quotes are sample data.')
              navigate(from, { replace: true })
            }}
          >
            Continue with an offline demo session
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="muted mt-s">
          New customer? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  )
}

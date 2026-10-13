// ROUTER — nested layout route. Header + footer stay mounted; the matched child route
// renders into <Outlet/>. NavLink gets an `isActive` flag for active styling.
import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, Outlet, ScrollRestoration, useNavigate, useNavigation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import styles from './Layout.module.css'
import { ClockBanner, SessionTimer } from './ClockBanner.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import ToastContainer from './ToastContainer.jsx'
import { selectCartCount } from '../store/cartSlice.js'
import { logout, selectUser } from '../store/authSlice.js'
import { fetchCatalogue } from '../store/catalogueSlice.js'
import { toast } from '../flux/ToastActions.js'
import { company, whatsappUrl, WHATSAPP_DISPLAY } from '../lib/config.js'

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/machines', label: 'Machines' },
  { to: '/estimate', label: 'Estimate' },
  { to: '/cart', label: 'Quote cart', badge: true },
  { to: '/track', label: 'Track order' },
  { to: '/my-quotes', label: 'My quotes' },
]

const STARTED_AT = Date.now()

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef(null)
  const cartCount = useSelector(selectCartCount)
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const navigation = useNavigation() // 'loading' while a route loader runs

  // Load the catalogue once for the whole app (thunk `condition` prevents repeats).
  useEffect(() => {
    dispatch(fetchCatalogue())
  }, [dispatch])

  // Keyboard: Escape closes the mobile menu and returns focus to the toggle button.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    dispatch(logout())
    toast.info('Signed out.')
    closeMenu()
    navigate('/login') // programmatic navigation
  }

  // NavLink className can be a function of { isActive } -> conditional class names.
  const linkClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)

  return (
    <>
      <ClockBanner />
      <header className={styles.header}>
        <div className={`container ${styles.bar}`}>
          <Link to="/" className={styles.brand} onClick={closeMenu}>
            <img src={company.logo} alt="PS Laser" width="120" height="40" />
            <span>
              Customer Portal
              <small>{company.location}</small>
            </span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? 'Close' : 'Menu'}
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>
        </div>
        <nav id="main-nav" className={`container ${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={closeMenu}>
              {l.label}
              {l.badge && cartCount > 0 && <span className={styles.badge} aria-label={`${cartCount} items`}>{cartCount}</span>}
            </NavLink>
          ))}
          {user ? (
            <button type="button" className={styles.logout} onClick={handleLogout}>
              Logout ({user.name?.split(' ')[0] ?? 'you'})
            </button>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={closeMenu}>Login</NavLink>
          )}
        </nav>
      </header>

      {navigation.state === 'loading' && <div className="route-progress" aria-hidden="true" />}

      <main id="content">
        <ErrorBoundary name="this page">
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerGrid}`}>
          <div>
            <strong style={{ color: '#fff' }}>{company.brand}</strong>
            <p>{company.tagline}</p>
            <p>{company.address}</p>
          </div>
          <div>
            <p>
              WhatsApp: <a href={whatsappUrl('Hi PS Laser, I have a sheet metal enquiry.')} target="_blank" rel="noreferrer">{WHATSAPP_DISPLAY}</a>
            </p>
            <p>
              Email: <a href={`mailto:${company.email}`}>{company.email}</a>
            </p>
          </div>
          <div>
            <p>CS3111 Unit II demo · React + Router + Redux + Flux</p>
            <SessionTimer startedAt={STARTED_AT} />
          </div>
        </div>
      </footer>

      <a className="wa-float" href={whatsappUrl('Hi PS Laser, I would like a quotation.')} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        WhatsApp
      </a>
      <ToastContainer />
      {/* scrolls to top on new pages, restores position on back/forward */}
      <ScrollRestoration />
    </>
  )
}

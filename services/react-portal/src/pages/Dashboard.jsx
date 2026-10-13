// Dashboard — composition of small components; JSX conditional rendering; lists with keys.
import { createElement } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Card from '../components/Card.jsx'
import ApiStatus from '../components/ApiStatus.jsx'
import RecentlyViewed from '../components/RecentlyViewed.jsx'
import OfflineBadge from '../components/OfflineBadge.jsx'
import { selectCartCount, selectEstimateTotal } from '../store/cartSlice.js'
import { selectUser } from '../store/authSlice.js'
import { selectIsMock, selectMachines } from '../store/catalogueSlice.js'
import { company, inr, whatsappUrl } from '../lib/config.js'

const QUICK_ACTIONS = [
  { to: '/machines', eyebrow: 'Catalogue', title: 'Browse machines', text: 'Fiber lasers, CNC press brake, Amada turret punches, laser welder and powder coating plant.' },
  { to: '/estimate', eyebrow: 'Estimate', title: 'Laser cutting estimate', text: 'Material, thickness, size, cut length, bends and powder coat — get an indicative price.' },
  { to: '/track', eyebrow: 'Orders', title: 'Track your order', text: 'Enter your order number and phone to see the live job status.' },
]

// JSX is only syntax sugar. Babel/esbuild compiles
//   <span className="eyebrow">PS Laser</span>
// into a function call that returns a plain object (a React element):
//   createElement('span', { className: 'eyebrow' }, 'PS Laser')
// Here is the same thing written WITHOUT JSX, used in the hero below:
const Eyebrow = ({ text }) => createElement('p', { className: 'eyebrow eyebrow--light' }, text)

export default function Dashboard() {
  const user = useSelector(selectUser)
  const cartCount = useSelector(selectCartCount)
  const estimateTotal = useSelector(selectEstimateTotal)
  const machines = useSelector(selectMachines)
  const machinesMock = useSelector(selectIsMock('machines'))

  return (
    <>
      <section className="hero">
        <div className="container">
          <Eyebrow text={`PS Laser · ${company.location}`} />
          {/* JSX expression + conditional (ternary) rendering */}
          <h1>{user ? `Welcome back, ${user.name}` : 'Customer Portal'}</h1>
          <p className="lead">{company.tagline}. Get an indicative estimate, build a quote cart and send it on WhatsApp in one go.</p>
          <div className="btn-row">
            <Link className="btn btn-primary btn-lg" to="/estimate">Get an estimate</Link>
            <a className="btn btn-light btn-lg" href={whatsappUrl('Hi PS Laser, I would like a quotation.')} target="_blank" rel="noreferrer">
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      <div className="container page">
        <ApiStatus />

        <div className="grid grid-3">
          {QUICK_ACTIONS.map((a) => (
            <Card
              key={a.to}
              eyebrow={a.eyebrow}
              title={a.title}
              actions={<Link className="btn btn-sm btn-primary" to={a.to}>Open</Link>}
            >
              <p>{a.text}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-2 mt">
          <Card
            title="Your quote cart"
            highlight={cartCount > 0}
            actions={<Link className="btn btn-sm btn-outline" to="/cart">View cart</Link>}
          >
            {cartCount === 0 ? (
              <p className="muted">Empty — add machines or estimates to send one combined enquiry.</p>
            ) : (
              <p>
                <strong>{cartCount}</strong> item{cartCount === 1 ? '' : 's'}
                {estimateTotal > 0 && <> · estimates total <strong>{inr(estimateTotal)}</strong></>}
              </p>
            )}
          </Card>
          <Card title="Recently viewed machines">
            <RecentlyViewed />
          </Card>
        </div>

        <h2 className="mt">Our machines</h2>
        <OfflineBadge show={machinesMock} what="machine list" />
        <ul className="machine-strip">
          {machines.map((m) => (
            <li key={m.slug}>
              <Link to={`/machines/${m.slug}`}>
                <img src={m.image} alt="" width="160" height="120" loading="lazy" />
                <span>{m.shortName}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

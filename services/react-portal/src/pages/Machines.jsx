// Machines catalogue — Redux state (useSelector/useDispatch), lists + keys, fragments with keys,
// controlled filter inputs, conditional rendering for loading/empty states.
import { Fragment, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import MachineCard from '../components/MachineCard.jsx'
import OfflineBadge from '../components/OfflineBadge.jsx'
import { selectIsMock, selectMachines, selectServices, selectCatalogueStatus } from '../store/catalogueSlice.js'
import { addItem, selectCartItems } from '../store/cartSlice.js'
import { toast } from '../flux/ToastActions.js'

export default function Machines() {
  const machines = useSelector(selectMachines)
  const services = useSelector(selectServices)
  const status = useSelector(selectCatalogueStatus)
  const isMock = useSelector(selectIsMock('machines'))
  const servicesMock = useSelector(selectIsMock('services'))
  const cartItems = useSelector(selectCartItems)
  const dispatch = useDispatch()

  // Category filter lives in the URL (?category=...) so it survives refresh / back button.
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'All'
  const [query, setQuery] = useState('')

  const categories = useMemo(() => ['All', ...new Set(machines.map((m) => m.category))], [machines])
  const visible = machines.filter(
    (m) =>
      (category === 'All' || m.category === category) &&
      `${m.name} ${m.specs.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  // Callback passed DOWN to every MachineCard; the card calls it UP with the machine.
  const handleAdd = (machine) => {
    dispatch(addItem({ kind: 'machine', ref: machine.slug, title: machine.name, detail: machine.category }))
    toast.success(`${machine.shortName} added to your quote cart`)
  }

  return (
    <div className="container page">
      <h1>Machines</h1>
      <p className="lead-dark">In-house machines at our Velu (Pune) plant. Add any machine to your quote cart or ask on WhatsApp.</p>
      <OfflineBadge show={isMock} what="machine list" />

      <div className="toolbar">
        <div className="chip-row" role="tablist" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={c === category}
              className={`chip${c === category ? ' chip--active' : ''}`}
              onClick={() => setSearchParams(c === 'All' ? {} : { category: c })}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="form-control toolbar__search"
          placeholder="Search e.g. 3 m, 32 Ton, SS"
          aria-label="Search machines"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
        />
      </div>

      {status === 'loading' && <p className="muted">Loading machines…</p>}
      {status !== 'loading' && visible.length === 0 && <p className="muted">No machine matches “{query}”.</p>}

      <div className="grid grid-3">
        {visible.map((m) => (
          <MachineCard
            key={m.slug}
            machine={m}
            inCart={cartItems.some((i) => i.kind === 'machine' && i.ref === m.slug)}
            onAdd={handleAdd}
          />
        ))}
      </div>

      <h2 className="mt">Services</h2>
      <OfflineBadge show={servicesMock} what="service list" />
      {/* A keyed Fragment lets one list item return TWO sibling elements (<dt> + <dd>). */}
      <dl className="service-list">
        {services.map((s) => (
          <Fragment key={s.slug}>
            <dt>{s.title}</dt>
            <dd>
              {s.description}{' '}
              <button
                type="button"
                className="btn btn-sm btn-link"
                onClick={() => {
                  dispatch(addItem({ kind: 'service', ref: s.slug, title: s.title, detail: 'Service' }))
                  toast.success(`${s.title} added to your quote cart`)
                }}
              >
                + add to cart
              </button>
            </dd>
          </Fragment>
        ))}
      </dl>
    </div>
  )
}

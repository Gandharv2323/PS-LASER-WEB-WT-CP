// ROUTER — dynamic segment /machines/:slug. Data comes from a route `loader` (runs before
// the page renders) and the slug is also read with useParams(). Unknown slug -> loader throws
// a 404 Response -> RouteError (errorElement).
import { useEffect } from 'react'
import { Link, useLoaderData, useNavigate, useParams, data } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getMachine } from '../lib/api.js'
import { addItem } from '../store/cartSlice.js'
import { viewMachine } from '../store/classic/recentlyViewed.js'
import OfflineBadge from '../components/OfflineBadge.jsx'
import { toast } from '../flux/ToastActions.js'
import { whatsappUrl } from '../lib/config.js'

// eslint-disable-next-line react-refresh/only-export-components
export async function machineLoader({ params }) {
  const { data: machine, source } = await getMachine(params.slug)
  if (!machine) throw data(`No machine called “${params.slug}”.`, { status: 404 })
  return { machine, source }
}

export default function MachineDetail() {
  const { slug } = useParams()
  const { machine, source } = useLoaderData()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Classic Redux action creator dispatched with the modern hook (both work on one store).
  useEffect(() => {
    dispatch(viewMachine(machine))
  }, [dispatch, machine])

  const quoteMessage = `Hi PS Laser, I need a quote on your ${machine.name}. Material: ___, Thickness: ___ mm, Quantity: ___. I can share the DXF/drawing.`

  const addToCart = () => {
    dispatch(addItem({ kind: 'machine', ref: machine.slug, title: machine.name, detail: machine.category }))
    toast.success(`${machine.shortName} added to your quote cart`)
  }

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/machines">Machines</Link> / <span aria-current="page">{slug}</span>
      </nav>
      <OfflineBadge show={source === 'mock'} what="machine" />
      <div className="detail">
        <img className="detail__img" src={machine.image} alt={machine.name} width="640" height="480" />
        <div>
          <p className="eyebrow">{machine.category}</p>
          <h1>{machine.name}</h1>
          <table className="table specs-table">
            <tbody>
              {machine.specs.map((spec, i) => (
                <tr key={spec}>
                  <th scope="row">Spec {i + 1}</th>
                  <td>{spec}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="btn-row">
            <a className="btn btn-whatsapp" href={whatsappUrl(quoteMessage)} target="_blank" rel="noreferrer">
              Get quote on WhatsApp
            </a>
            <button type="button" className="btn btn-primary" onClick={addToCart}>Add to quote cart</button>
            {/* programmatic navigation with state handed to the next route */}
            <button type="button" className="btn btn-outline" onClick={() => navigate('/estimate', { state: { machine: machine.shortName } })}>
              Estimate a part
            </button>
            <button type="button" className="btn btn-link" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// INLINE STYLE OBJECTS — styles as JS objects (camelCase keys), handy for values computed
// at render time such as the width of each cost bar.
import PropTypes from 'prop-types'
import { ESTIMATE_NOTE, inr } from '../lib/config.js'

const LABELS = { material: 'Material', cutting: 'Laser cutting', piercing: 'Piercing', bending: 'Bending', coating: 'Powder coating' }

const styles = {
  barTrack: { background: '#f2f2f2', height: 6, borderRadius: 3, marginTop: 4 },
  totalRow: { fontWeight: 700, fontSize: '1.1rem', borderTop: '2px solid var(--ink)' },
  note: { color: 'var(--brand-dark)', fontWeight: 500, margin: '10px 0 0' },
}

export default function BreakdownTable({ estimate, offline = false }) {
  const parts = Object.entries(estimate.breakdown)
  const max = Math.max(...parts.map(([, v]) => Number(v)), 1)

  return (
    <div className="breakdown">
      <table className="table">
        <caption>
          {estimate.materialCode} · {estimate.thicknessMm} mm · qty {estimate.quantity}
          {offline && <span className="tag tag-warning">offline demo calc</span>}
        </caption>
        <thead>
          <tr>
            <th scope="col">Per part</th>
            <th scope="col" className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {parts.map(([key, value]) => (
            <tr key={key}>
              <td>
                {LABELS[key] ?? key}
                <div style={styles.barTrack}>
                  {/* dynamic inline style: bar width proportional to the cost share */}
                  <div style={{ width: `${(Number(value) / max) * 100}%`, height: '100%', background: 'var(--brand)', borderRadius: 3 }} />
                </div>
              </td>
              <td className="num">{inr(value)}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Per part</th>
            <td className="num">{inr(estimate.perPart)}</td>
          </tr>
          <tr>
            <th scope="row">Subtotal × {estimate.quantity}</th>
            <td className="num">{inr(estimate.subtotal)}</td>
          </tr>
          <tr>
            <th scope="row">GST</th>
            <td className="num">{inr(estimate.gst)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <th scope="row">Total</th>
            <td className="num">{inr(estimate.total)}</td>
          </tr>
        </tbody>
      </table>
      <p style={styles.note}>
        {ESTIMATE_NOTE}
        {estimate.isSample && ' (sample rate card)'}
      </p>
    </div>
  )
}

BreakdownTable.propTypes = {
  estimate: PropTypes.shape({
    materialCode: PropTypes.string,
    thicknessMm: PropTypes.number,
    quantity: PropTypes.number,
    breakdown: PropTypes.objectOf(PropTypes.number).isRequired,
    perPart: PropTypes.number,
    subtotal: PropTypes.number,
    gst: PropTypes.number,
    total: PropTypes.number,
    isSample: PropTypes.bool,
  }).isRequired,
  offline: PropTypes.bool,
}

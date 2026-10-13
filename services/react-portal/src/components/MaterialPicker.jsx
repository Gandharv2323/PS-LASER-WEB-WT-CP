// CHILD -> PARENT data flow. MaterialPicker owns no material state; the parent
// (EstimateForm) passes `value` down and receives the user's choice through the
// `onChange` callback prop. Arrow keys move the selection (keyboard events).
import PropTypes from 'prop-types'
import { usePropTypes } from '../lib/propCheck.js'

export default function MaterialPicker(props) {
  usePropTypes(MaterialPicker, props)
  const { materials, value, onChange, error } = props

  const handleKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const idx = materials.findIndex((m) => m.code === value)
    const step = e.key === 'ArrowRight' ? 1 : -1
    const next = materials[(idx + step + materials.length) % materials.length]
    onChange(next.code, next) // send data UP to the parent
  }

  return (
    <fieldset className="material-picker">
      <legend>Material</legend>
      <div className="chip-row" role="radiogroup" aria-label="Material" onKeyDown={handleKeyDown}>
        {materials.map((m) => (
          <button
            key={m.code}
            type="button"
            role="radio"
            aria-checked={value === m.code}
            tabIndex={value === m.code || (!value && m === materials[0]) ? 0 : -1}
            className={`chip${value === m.code ? ' chip--active' : ''}`}
            onClick={() => onChange(m.code, m)}
          >
            {m.name}
            <small> · up to {m.maxThicknessMm} mm</small>
          </button>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  )
}

MaterialPicker.propTypes = {
  materials: PropTypes.arrayOf(
    PropTypes.shape({ code: PropTypes.string.isRequired, name: PropTypes.string.isRequired, maxThicknessMm: PropTypes.number }),
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
}

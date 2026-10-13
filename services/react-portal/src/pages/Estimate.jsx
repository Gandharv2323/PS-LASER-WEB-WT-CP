// FORMS — a controlled form (every input's value lives in React state), validation with
// per-field error messages, submit handling with preventDefault, child -> parent data via
// MaterialPicker's onChange, refs for focusing the first invalid field, keyboard Escape = reset.
import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import MaterialPicker from '../components/MaterialPicker.jsx'
import TextField from '../components/TextField.jsx'
import BreakdownTable from '../components/BreakdownTable.jsx'
import OfflineBadge from '../components/OfflineBadge.jsx'
import { selectIsMock, selectMaterials } from '../store/catalogueSlice.js'
import { addItem } from '../store/cartSlice.js'
import { postEstimate } from '../lib/api.js'
import { toast } from '../flux/ToastActions.js'
import { ESTIMATE_NOTE, inr, whatsappUrl } from '../lib/config.js'
import { NUMERIC, validateEstimate } from '../lib/validateEstimate.js'

const INITIAL = {
  materialCode: 'MS',
  thicknessMm: '2',
  lengthMm: '500',
  widthMm: '300',
  cutLengthMm: '1600',
  pierces: '4',
  bends: '2',
  powderCoat: false,
  quantity: '50',
}

export default function Estimate() {
  const materials = useSelector(selectMaterials)
  const materialsMock = useSelector(selectIsMock('materials'))
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const fromMachine = location.state?.machine // passed by MachineDetail via navigate(state)

  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null) // { data, source }
  const [submitting, setSubmitting] = useState(false)

  // One ref object per field so we can focus the first invalid input (focus management).
  const fieldRefs = useRef({})
  const setFieldRef = (name) => (el) => {
    fieldRefs.current[name] = el
  }

  // Single change handler for every input, using the synthetic event's target name/value.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }))
    setErrors((errs) => ({ ...errs, [name]: undefined }))
  }

  // Child -> parent: MaterialPicker calls this with the selected code.
  const handleMaterial = (code) => {
    setValues((v) => ({ ...v, materialCode: code }))
    setErrors((errs) => ({ ...errs, materialCode: undefined, thicknessMm: undefined }))
  }

  const reset = () => {
    setValues(INITIAL)
    setErrors({})
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // stop the browser's full-page form POST
    const errs = validateEstimate(values, materials)
    setErrors(errs)
    const firstBad = Object.keys(errs).find((k) => errs[k])
    if (firstBad) {
      fieldRefs.current[firstBad]?.focus()
      return
    }
    const input = { ...values }
    for (const k of NUMERIC) input[k] = Number(values[k])
    setSubmitting(true)
    try {
      const res = await postEstimate(input)
      setResult(res)
      if (res.source === 'mock') toast.warning('Spring Boot is offline — showing an offline demo estimate (sample rates).')
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors)
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const addToCart = () => {
    const est = result.data
    const mat = materials.find((m) => m.code === est.materialCode)
    dispatch(
      addItem({
        kind: 'estimate',
        ref: `${est.materialCode}-${est.thicknessMm}`,
        title: `${mat?.name ?? est.materialCode} ${est.thicknessMm} mm · ${values.lengthMm}×${values.widthMm} mm`,
        detail: `${est.quantity} pcs · ${values.bends} bends${values.powderCoat ? ' · powder coat' : ''}`,
        qty: est.quantity,
        estimate: est,
        input: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, NUMERIC.includes(k) ? Number(v) : v])),
        offline: result.source === 'mock',
      }),
    )
    toast.success('Estimate added to your quote cart')
    navigate('/cart')
  }

  const fieldProps = (name, label, extra = {}) => ({
    name,
    label,
    value: values[name],
    onChange: handleChange,
    error: errors[name],
    ref: setFieldRef(name),
    inputMode: 'decimal',
    type: 'number',
    step: 'any',
    ...extra,
  })

  return (
    <div className="container page">
      <h1>Laser cutting estimate</h1>
      <p className="lead-dark">
        {fromMachine ? <>Estimating a part for the <strong>{fromMachine}</strong>. </> : null}
        Fill the part details — press <kbd>Esc</kbd> to reset.
      </p>
      <OfflineBadge show={materialsMock} what="material list" />

      <div className="estimate-layout">
        <form className="panel" onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Escape' && reset()} noValidate>
          {materials.length > 0 && (
            <MaterialPicker materials={materials} value={values.materialCode} onChange={handleMaterial} error={errors.materialCode} />
          )}
          <div className="form-grid">
            <TextField {...fieldProps('thicknessMm', 'Thickness (mm)')} min="0.5" />
            <TextField {...fieldProps('quantity', 'Quantity (pcs)', { inputMode: 'numeric', step: 1 })} min="1" />
            <TextField {...fieldProps('lengthMm', 'Blank length (mm)')} hint="Max 3000" />
            <TextField {...fieldProps('widthMm', 'Blank width (mm)')} hint="Max 1500" />
            <TextField {...fieldProps('cutLengthMm', 'Total cut length (mm)')} hint="Perimeter + holes" />
            <TextField {...fieldProps('pierces', 'Pierces', { inputMode: 'numeric', step: 1 })} />
            <TextField {...fieldProps('bends', 'Bends', { inputMode: 'numeric', step: 1 })} />
          </div>
          <label className="check">
            <input type="checkbox" name="powderCoat" checked={values.powderCoat} onChange={handleChange} />
            Powder coating (both sides)
          </label>
          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Calculating…' : 'Calculate estimate'}
            </button>
            <button type="button" className="btn btn-outline" onClick={reset}>Reset</button>
          </div>
        </form>

        <section className="panel" aria-live="polite">
          <h2>Result</h2>
          {!result && <p className="muted">Your price breakdown will appear here. {ESTIMATE_NOTE}.</p>}
          {result && (
            <>
              <BreakdownTable estimate={result.data} offline={result.source === 'mock'} />
              <div className="btn-row">
                <button type="button" className="btn btn-primary" onClick={addToCart}>Add to quote cart</button>
                <a
                  className="btn btn-whatsapp"
                  target="_blank"
                  rel="noreferrer"
                  href={whatsappUrl(
                    `Hi PS Laser, indicative estimate from the portal: ${result.data.materialCode} ${result.data.thicknessMm} mm, ${values.lengthMm}x${values.widthMm} mm, qty ${result.data.quantity}, total ${inr(result.data.total)}. Please confirm the final quote.`,
                  )}
                >
                  Confirm on WhatsApp
                </a>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

// REFS — forwardRef lets a PARENT hold a ref to the <input> rendered inside this child,
// e.g. EstimateForm focuses the first invalid field, Login focuses the email box on mount.
// (React 19 also accepts `ref` as a normal prop on function components; forwardRef is the
// classic API taught in the syllabus and still works.)
import { forwardRef, useId } from 'react'
import PropTypes from 'prop-types'
import { reactNode } from '../lib/propCheck.js'

const TextField = forwardRef(function TextField({ label, error, hint, className = '', ...inputProps }, ref) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={ref}
        className={`form-control${error ? ' is-invalid' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-err`} className="field-error">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>
      )}
    </div>
  )
})

TextField.propTypes = {
  label: reactNode, // required in practice: every field needs a visible label
  error: PropTypes.string,
  hint: reactNode,
  className: PropTypes.string,
}

export default TextField

// PROPS + MOUSE EVENTS + CSS MODULES + CONDITIONAL CLASSNAMES.
// Parent (Machines page) passes data down via props and an `onAdd` callback up.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './MachineCard.module.css'
import { usePropTypes } from '../lib/propCheck.js'

export default function MachineCard(props) {
  usePropTypes(MachineCard, props)
  const { machine, inCart = false, onAdd, specsToShow = 2 } = props
  const [hovered, setHovered] = useState(false)

  // Conditional classNames built from state/props (no helper library needed).
  const className = [styles.card, hovered && styles.hovered, inCart && styles.inCart].filter(Boolean).join(' ')

  return (
    <article
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid="machine-card"
    >
      <div className={styles.media}>
        <img src={machine.image} alt={machine.name} loading="lazy" width="400" height="300" />
        <span className={styles.category}>{machine.category}</span>
        {hovered && <div className={styles.overlay}>{machine.specs.length} specs · click for details</div>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link to={`/machines/${machine.slug}`}>{machine.shortName}</Link>
        </h3>
        <ul className={styles.specs}>
          {machine.specs.slice(0, specsToShow).map((spec) => (
            <li key={spec}>{spec}</li>
          ))}
        </ul>
      </div>
      <div className={styles.actions}>
        <Link className="btn btn-sm btn-outline" to={`/machines/${machine.slug}`}>Details</Link>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => onAdd(machine)}>
          {inCart ? 'Add again' : 'Add to quote cart'}
        </button>
      </div>
    </article>
  )
}

MachineCard.propTypes = {
  machine: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    category: PropTypes.string,
    image: PropTypes.string,
    specs: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  inCart: PropTypes.bool,
  onAdd: PropTypes.func.isRequired,
  specsToShow: PropTypes.number,
}

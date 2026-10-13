// COMPONENT COMPOSITION — a generic Card that knows nothing about PS Laser.
// Callers compose it with `children` (body) and named "slots" passed as JSX props
// (`media`, `actions`) instead of making many specialised card components.
import PropTypes from 'prop-types'
import { reactNode, usePropTypes } from '../lib/propCheck.js'

export default function Card(props) {
  usePropTypes(Card, props)
  const { title, eyebrow, media = null, actions = null, highlight = false, children } = props
  return (
    <article className={`card${highlight ? ' card--highlight' : ''}`}>
      {media && <div className="card__media">{media}</div>}
      <div className="card__body">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h3 className="card__title">{title}</h3>}
        {children}
      </div>
      {actions && <div className="card__actions">{actions}</div>}
    </article>
  )
}

Card.propTypes = {
  title: reactNode,
  eyebrow: PropTypes.string,
  media: reactNode,
  actions: reactNode,
  highlight: PropTypes.bool,
  children: reactNode,
}

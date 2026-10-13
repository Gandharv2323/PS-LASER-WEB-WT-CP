// PropTypes in React 19.
// React 19 no longer runs `Component.propTypes` checks automatically (it silently ignores them),
// and `defaultProps` is only honoured on CLASS components. We still declare propTypes on our
// function components as typed documentation, and this hook runs the same check by hand in
// development so a wrong prop still prints a console warning, like React <=18 did.
import PropTypes from 'prop-types'
import { isValidElement } from 'react'

export function usePropTypes(Component, props) {
  if (import.meta.env.DEV && Component.propTypes) {
    PropTypes.checkPropTypes(Component.propTypes, props, 'prop', Component.displayName || Component.name)
  }
}

// prop-types 15.8's PropTypes.node / PropTypes.element look for the React <=18 element
// symbol, so they reject React 19 elements ("react.transitional.element"). This validator
// uses React's own isValidElement instead and is used where a prop accepts JSX.
const isNode = (v) =>
  v == null || typeof v === 'boolean' || typeof v === 'string' || typeof v === 'number' ||
  isValidElement(v) || (Array.isArray(v) && v.every(isNode))

export function reactNode(props, propName, componentName) {
  if (!isNode(props[propName])) {
    return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`, expected renderable JSX.`)
  }
  return null
}

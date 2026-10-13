// CLASS COMPONENT — error boundary. Only class components can catch render errors:
// getDerivedStateFromError (render phase, update state) + componentDidCatch (commit phase, log).
import { Component } from 'react'
import PropTypes from 'prop-types'
import { reactNode } from '../lib/propCheck.js'
import { whatsappUrl } from '../lib/config.js'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="alert alert-danger" role="alert">
          <h2>Something went wrong in “{this.props.name}”.</h2>
          <p className="muted">{String(this.state.error.message)}</p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={this.reset}>Try again</button>
            <a className="btn btn-outline" href={whatsappUrl('Hi PS Laser, the customer portal showed an error. I need a quote.')} target="_blank" rel="noreferrer">
              WhatsApp us instead
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = { name: PropTypes.string, children: reactNode }
ErrorBoundary.defaultProps = { name: 'this section' }

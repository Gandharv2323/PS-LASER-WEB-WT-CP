// COMPONENT LIFECYCLE — the same "live clock" written twice:
//   ClockBanner  -> CLASS component (constructor, setState, lifecycle methods, createRef, defaultProps)
//   SessionTimer -> FUNCTION component (useState + useEffect with cleanup) for comparison.
import { Component, createRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const fmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
})
const dayFmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })

export class ClockBanner extends Component {
  // MOUNTING 1: constructor — initialise state and refs, bind handlers. No side effects here.
  constructor(props) {
    super(props)
    this.state = { now: new Date(), ticks: 0, paused: false }
    this.timeRef = createRef() // createRef() is the class-component way to reach a DOM node
    this.togglePause = this.togglePause.bind(this)
    console.info('[ClockBanner] constructor')
  }

  // MOUNTING 3: componentDidMount — DOM exists; start timers / subscriptions here.
  componentDidMount() {
    console.info('[ClockBanner] componentDidMount — starting interval', this.props.intervalMs, 'ms')
    this.timer = setInterval(this.tick, this.props.intervalMs)
    this.timeRef.current?.setAttribute('data-mounted', 'true')
  }

  // UPDATING 1: shouldComponentUpdate — skip a render when nothing visible changed.
  // The interval fires every second, but if paused the displayed text is identical.
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.paused !== this.state.paused) return true
    if (nextState.paused) return false
    return fmt.format(nextState.now) !== fmt.format(this.state.now) || nextProps.label !== this.props.label
  }

  // UPDATING 3: componentDidUpdate — runs after re-render; compare with previous state.
  componentDidUpdate(_prevProps, prevState) {
    // Log once per minute (not every second) to keep the console readable.
    if (prevState.now.getMinutes() !== this.state.now.getMinutes()) {
      console.info('[ClockBanner] componentDidUpdate — minute changed, ticks so far:', this.state.ticks)
    }
    if (prevState.paused !== this.state.paused) {
      console.info('[ClockBanner] componentDidUpdate — paused =', this.state.paused)
    }
  }

  // UNMOUNTING: componentWillUnmount — always clean up timers to avoid leaks.
  componentWillUnmount() {
    console.info('[ClockBanner] componentWillUnmount — clearing interval')
    clearInterval(this.timer)
  }

  // Class field arrow function: `this` is auto-bound.
  tick = () => {
    // setState with an updater function because the new state depends on the old one.
    this.setState((prev) => ({ now: new Date(), ticks: prev.ticks + 1 }))
  }

  togglePause() {
    this.setState((prev) => ({ paused: !prev.paused }))
    // forceUpdate() demo (deliberately NOT called): this.forceUpdate() would skip
    // shouldComponentUpdate and re-render even if state did not change. Only needed when a
    // render depends on data React does not know about (e.g. a mutable external object).
  }

  // MOUNTING 2 / UPDATING 2: render — pure function of props + state, returns JSX.
  render() {
    const { label } = this.props
    const { now, paused } = this.state
    return (
      <div className="clock-banner" role="status">
        <span>
          {label}: <strong ref={this.timeRef}>{fmt.format(now)}</strong> · {dayFmt.format(now)}
        </span>
        <button type="button" className="clock-banner__btn" onClick={this.togglePause} aria-pressed={paused}>
          {paused ? 'Resume clock' : 'Pause clock'}
        </button>
      </div>
    )
  }
}

// defaultProps still works for CLASS components in React 19.
ClockBanner.defaultProps = { intervalMs: 1000, label: 'Pune (IST)' }
ClockBanner.propTypes = { intervalMs: PropTypes.number, label: PropTypes.string }

/** Hooks version of a ticking timer — compare with the class above. */
export function SessionTimer({ startedAt }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // effect body = componentDidMount (+ DidUpdate when deps change)
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    // returned cleanup = componentWillUnmount
    return () => clearInterval(id)
  }, [startedAt])

  const m = Math.floor(seconds / 60)
  return (
    <span className="session-timer">
      On the portal for {m > 0 ? `${m} min ` : ''}
      {seconds % 60} s
    </span>
  )
}
SessionTimer.propTypes = { startedAt: PropTypes.number.isRequired }

// Minimal browser EventEmitter (Node's `events` module is not available in the browser).
// Flux stores extend this so views can subscribe to 'change'.
export default class EventEmitter {
  constructor() {
    this._listeners = {}
  }

  on(event, fn) {
    ;(this._listeners[event] ??= new Set()).add(fn)
    return this
  }

  off(event, fn) {
    this._listeners[event]?.delete(fn)
    return this
  }

  emit(event, ...args) {
    this._listeners[event]?.forEach((fn) => fn(...args))
    return this
  }
}

// =====================================================================================
//  FLUX — Dispatcher
// =====================================================================================
// Facebook's `flux` npm package (v4.0.4) is archived and its peerDependencies stop at
// React 17 (`react: ^15 || ^16 || ^17`), so `npm install flux` fails against React 19.
// The Dispatcher itself has no React code, so we implement the same public API here
// (register / unregister / waitFor / dispatch / isDispatching) in ~50 lines. It behaves
// like flux/lib/Dispatcher: one central hub, callbacks run synchronously, and a new
// dispatch cannot start while another is still running ("cascading updates" guard).
//
//                FLUX (one-way data flow, many stores)
//
//   ┌────────┐   ┌──────────────┐   ┌────────────┐   ┌──────────────┐
//   │ Action │──▶│  Dispatcher  │──▶│  Store(s)  │──▶│ View (React) │
//   └────────┘   │ (singleton)  │   │ EventEmitter│   │  re-renders  │
//       ▲        └──────────────┘   └────────────┘   └──────┬───────┘
//       └──────────────── user event calls action creator ◀─┘
//
//                REDUX (one store, pure reducers)
//
//   View ──dispatch(action)──▶ Store ──(state, action)──▶ reducer(s) ──▶ new state ──▶ View
//
//   Flux vs Redux:
//   * Flux: many stores, each holds mutable state and emits 'change'; a Dispatcher
//     singleton broadcasts every action to every registered store; waitFor() orders stores.
//   * Redux: ONE store, state is immutable, logic lives in PURE reducer functions
//     (state, action) => newState; no dispatcher object — store.dispatch does it;
//     middleware (thunks) handles async; devtools can time-travel because state is a value.
//   In this portal: Flux drives the toast notifications (src/flux/*), Redux drives
//   cart/auth/catalogue (src/store/*), so both patterns can be compared side by side.
// =====================================================================================

let lastId = 0

export default class Dispatcher {
  constructor() {
    this._callbacks = new Map() // id -> callback
    this._isPending = new Map()
    this._isHandled = new Map()
    this._isDispatching = false
    this._pendingPayload = null
  }

  /** Register a store callback; returns a token used by waitFor/unregister. */
  register(callback) {
    const id = `ID_${++lastId}`
    this._callbacks.set(id, callback)
    return id
  }

  unregister(id) {
    this._callbacks.delete(id)
  }

  /** Inside a store callback: make sure the given stores have handled the current action first. */
  waitFor(ids) {
    if (!this._isDispatching) throw new Error('Dispatcher.waitFor(...): must be invoked while dispatching.')
    for (const id of ids) {
      if (this._isPending.get(id)) {
        if (!this._isHandled.get(id)) throw new Error(`Dispatcher.waitFor(...): circular dependency on ${id}`)
        continue
      }
      this._invoke(id)
    }
  }

  /** Broadcast an action payload to every registered store. */
  dispatch(payload) {
    if (this._isDispatching) throw new Error('Dispatch.dispatch(...): cannot dispatch in the middle of a dispatch.')
    this._isDispatching = true
    this._pendingPayload = payload
    for (const id of this._callbacks.keys()) {
      this._isPending.set(id, false)
      this._isHandled.set(id, false)
    }
    try {
      for (const id of this._callbacks.keys()) {
        if (!this._isPending.get(id)) this._invoke(id)
      }
    } finally {
      this._isDispatching = false
      this._pendingPayload = null
    }
  }

  isDispatching() {
    return this._isDispatching
  }

  _invoke(id) {
    this._isPending.set(id, true)
    this._callbacks.get(id)(this._pendingPayload)
    this._isHandled.set(id, true)
  }
}

/** The single app-wide dispatcher (Flux has exactly one). */
export const AppDispatcher = new Dispatcher()

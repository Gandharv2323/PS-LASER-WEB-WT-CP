// FLUX — Store. Holds the list of visible toasts, registers with the Dispatcher,
// mutates its own private state for each action and emits 'change' to subscribed views.
import EventEmitter from './EventEmitter.js'
import { AppDispatcher } from './Dispatcher.js'
import { ToastActionTypes } from './ToastActions.js'

const CHANGE = 'change'
const MAX_TOASTS = 4

class ToastStore extends EventEmitter {
  constructor() {
    super()
    this._toasts = []
    // Registering returns a dispatch token (another store could waitFor([ToastStore.dispatchToken])).
    this.dispatchToken = AppDispatcher.register(this._onAction.bind(this))
  }

  getAll() {
    return this._toasts
  }

  addChangeListener(fn) {
    this.on(CHANGE, fn)
  }

  removeChangeListener(fn) {
    this.off(CHANGE, fn)
  }

  _onAction(action) {
    switch (action.type) {
      case ToastActionTypes.SHOW:
        // new array reference so React's useSyncExternalStore sees a change
        this._toasts = [...this._toasts, action.toast].slice(-MAX_TOASTS)
        this.emit(CHANGE)
        break
      case ToastActionTypes.DISMISS:
        this._toasts = this._toasts.filter((t) => t.id !== action.id)
        this.emit(CHANGE)
        break
      default:
      // Flux stores receive EVERY action; ignore the ones we do not care about.
    }
  }
}

export default new ToastStore()

// FLUX — action types + action creators for toast notifications.
// An action creator just builds a plain {type, ...} object and hands it to the Dispatcher.
import { AppDispatcher } from './Dispatcher.js'

export const ToastActionTypes = Object.freeze({
  SHOW: 'toast/SHOW',
  DISMISS: 'toast/DISMISS',
})

let nextId = 1

export const ToastActions = {
  /** kind: 'success' | 'info' | 'warning' | 'error' */
  show(message, kind = 'info', timeoutMs = 3500) {
    const id = nextId++
    AppDispatcher.dispatch({ type: ToastActionTypes.SHOW, toast: { id, message, kind } })
    if (timeoutMs > 0) setTimeout(() => ToastActions.dismiss(id), timeoutMs)
    return id
  },
  dismiss(id) {
    AppDispatcher.dispatch({ type: ToastActionTypes.DISMISS, id })
  },
}

// Shorthands used across the portal.
export const toast = {
  success: (m) => ToastActions.show(m, 'success'),
  info: (m) => ToastActions.show(m, 'info'),
  warning: (m) => ToastActions.show(m, 'warning', 5000),
  error: (m) => ToastActions.show(m, 'error', 6000),
}

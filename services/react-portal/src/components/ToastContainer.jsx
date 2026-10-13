// FLUX — View. Subscribes to the ToastStore 'change' event, copies the store's data into
// local state, and re-renders. User clicks call an action creator (never the store directly).
import { useEffect, useState } from 'react'
import ToastStore from '../flux/ToastStore.js'
import { ToastActions } from '../flux/ToastActions.js'

export default function ToastContainer() {
  const [toasts, setToasts] = useState(() => ToastStore.getAll())

  useEffect(() => {
    const onChange = () => setToasts(ToastStore.getAll())
    ToastStore.addChangeListener(onChange) // subscribe on mount
    return () => ToastStore.removeChangeListener(onChange) // unsubscribe on unmount
  }, [])

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
          <span>{t.message}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => ToastActions.dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

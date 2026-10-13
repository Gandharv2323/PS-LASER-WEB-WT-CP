// Shows whether the Spring Boot and Node backends are reachable (useEffect + async fetch).
import { useEffect, useState } from 'react'
import { health } from '../lib/api.js'

const LABEL = { checking: 'checking…', online: 'online', offline: 'offline (demo data)' }

export default function ApiStatus() {
  const [status, setStatus] = useState({ spring: 'checking', node: 'checking' })

  useEffect(() => {
    let cancelled = false // ignore the result if the component unmounted meanwhile
    health().then((s) => !cancelled && setStatus(s))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ul className="api-status" aria-label="Backend status">
      {[
        ['spring', 'Spring Boot API :8081'],
        ['node', 'Node enquiry API :4000'],
      ].map(([key, label]) => (
        <li key={key} className={`pill pill-${status[key]}`}>
          <span className="dot" aria-hidden="true" /> {label}: {LABEL[status[key]]}
        </li>
      ))}
    </ul>
  )
}

// Shown wherever the UI is rendering OFFLINE DEMO DATA instead of a live API response.
import PropTypes from 'prop-types'

export default function OfflineBadge({ show = true, what = 'data' }) {
  if (!show) return null // conditional rendering: returning null renders nothing
  return (
    <p className="offline-badge" role="note">
      <strong>Offline demo data</strong> — the API is not reachable, so this {what} comes from the portal’s built-in sample copy.
    </p>
  )
}

OfflineBadge.propTypes = { show: PropTypes.bool, what: PropTypes.string }

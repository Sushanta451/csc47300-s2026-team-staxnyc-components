const FIELD_LABELS = {
  display_name: 'Display name',
  avatar_url: 'Avatar URL',
  bio: 'Bio',
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]).join('').toUpperCase()
}

function timeAgo(iso) {
  const then = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - then)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function PendingRequestRow({ request, requesterName, busy, onApprove, onReject }) {
  return (
    <li className="pending-row">
      <div className="pending-avatar" aria-hidden="true">
        {getInitials(requesterName)}
      </div>

      <div className="pending-main">
        <div className="pending-who">
          <span className="pending-name">{requesterName || 'Unknown user'}</span>
          <span className="pending-dot">·</span>
          <span className="pending-date" title={new Date(request.created_at).toLocaleString()}>
            {timeAgo(request.created_at)}
          </span>
        </div>
        <div className="pending-change">
          <span className="pending-field-pill">
            {FIELD_LABELS[request.field] || request.field}
          </span>
          <span className="pending-arrow" aria-hidden="true">→</span>
          <span className="pending-value" title={request.new_value}>
            {request.new_value || <em style={{ color: 'var(--muted)' }}>(empty)</em>}
          </span>
        </div>
      </div>

      <div className="pending-actions">
        <button
          className="btn-ghost danger"
          disabled={busy}
          onClick={() => onReject(request)}
        >
          {busy ? '…' : 'Reject'}
        </button>
        <button
          className="btn primary"
          disabled={busy}
          onClick={() => onApprove(request)}
        >
          {busy ? '…' : 'Approve'}
        </button>
      </div>
    </li>
  )
}

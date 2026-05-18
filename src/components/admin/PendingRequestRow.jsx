const FIELD_LABELS = {
  display_name: 'Display name',
  avatar_url: 'Avatar URL',
  bio: 'Bio',
}

export default function PendingRequestRow({ request, requesterName, busy, onApprove, onReject }) {
  return (
    <li className="pending-row">
      <div className="pending-main">
        <div className="pending-who">
          <span className="pending-name">{requesterName || 'Unknown user'}</span>
          <span className="pending-date">
            {new Date(request.created_at).toLocaleString()}
          </span>
        </div>
        <div className="pending-change">
          <span className="pending-field">{FIELD_LABELS[request.field] || request.field}</span>
          <span className="pending-arrow">→</span>
          <span className="pending-value">{request.new_value}</span>
        </div>
      </div>
      <div className="pending-actions">
        <button className="btn-ghost" disabled={busy} onClick={() => onReject(request)}>
          Reject
        </button>
        <button className="btn primary" disabled={busy} onClick={() => onApprove(request)}>
          Approve
        </button>
      </div>
    </li>
  )
}

const STYLES = {
  pending:  { bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.4)',  color: '#facc15', label: 'Pending'  },
  approved: { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  color: '#4ade80', label: 'Approved' },
  rejected: { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  color: '#f87171', label: 'Rejected' },
}

export default function RequestStatusBadge({ status }) {
  const s = STYLES[status] || STYLES.pending
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.18rem 0.55rem',
      borderRadius: 999,
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

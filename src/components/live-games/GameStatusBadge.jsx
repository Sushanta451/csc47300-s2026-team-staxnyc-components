export default function GameStatusBadge({ status }) {
  const s = (status || '').toLowerCase()
  const isLive = s === 'live'
  const isScheduled = s === 'scheduled' || s === 'upcoming'

  return (
    <span style={{
      fontSize: '0.8rem',
      fontWeight: 700,
      padding: '0.25rem 0.6rem',
      borderRadius: '999px',
      background: isLive ? 'rgba(45,212,191,0.15)' : isScheduled ? 'rgba(91,140,255,0.15)' : 'rgba(255,255,255,0.06)',
      color: isLive ? 'var(--success)' : isScheduled ? 'var(--accent)' : 'var(--muted)',
      border: `1px solid ${isLive ? 'rgba(45,212,191,0.3)' : isScheduled ? 'rgba(91,140,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      {isLive ? '🔴 LIVE' : isScheduled ? 'Scheduled' : 'Final'}
    </span>
  )
}

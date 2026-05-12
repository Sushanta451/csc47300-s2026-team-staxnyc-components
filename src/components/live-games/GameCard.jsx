import GameStatusBadge from './GameStatusBadge'
import TeamScoreRow from './TeamScoreRow'

function formatGameTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function GameCard({ game }) {
  const status = (game.status || '').toLowerCase()
  const isLive = status === 'live'
  const isScheduled = status === 'scheduled' || status === 'upcoming'

  return (
    <div
      className="card"
      style={{ padding: '1.2rem', transition: 'transform 0.18s ease,border-color 0.18s ease' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(91,140,255,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = ''}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <GameStatusBadge status={game.status} />
        {isLive && game.quarter && (
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
            {game.quarter} {game.time_remaining}
          </span>
        )}
        {isScheduled && game.game_date && (
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
            {formatGameTime(game.game_date)}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <TeamScoreRow teamName={game.away_team} score={game.away_score} />
        <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 700 }}>vs</p>
        </div>
        <TeamScoreRow teamName={game.home_team} score={game.home_score} />
      </div>
    </div>
  )
}

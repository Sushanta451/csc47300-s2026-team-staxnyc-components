import { useState } from 'react'
import GameStatusBadge from './GameStatusBadge'
import TeamScoreRow from './TeamScoreRow'
import AskAboutPredictionModal from '../predictions/AskAboutPredictionModal'
import LiveChatModal from '../live-chat/LiveChatModal'
import { useAuth } from '../../lib/AuthContext'
import { deleteLiveGame } from '../../lib/api'

function formatGameTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function shortTeamName(full) {
  if (!full) return ''
  const parts = String(full).trim().split(/\s+/)
  return parts[parts.length - 1]
}

export default function GameCard({ game, prediction, onDelete }) {
  const { isAdmin } = useAuth()
  const [askOpen, setAskOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const status = (game.status || '').toLowerCase()
  const isLive = status === 'live'

  async function handleDelete() {
    if (deleting) return
    const ok = window.confirm(`Delete ${game.away_team} at ${game.home_team}?`)
    if (!ok) return
    setDeleting(true)
    try {
      const count = await deleteLiveGame(game.game_id)
      if (count === 0) {
        window.alert('Nothing was deleted — your admin role may not be applied yet.')
        setDeleting(false)
        return
      }
      if (onDelete) onDelete(game.game_id)
    } catch (e) {
      window.alert('Delete failed: ' + (e?.message || 'unknown'))
      setDeleting(false)
    }
  }
  const isScheduled = status === 'scheduled' || status === 'upcoming'
  const showPrediction = status === 'scheduled' && prediction

  let predictedTeamFull = null
  if (showPrediction) {
    const isHome = prediction.prediction === 'home'
    predictedTeamFull = isHome ? game.home_team : game.away_team
  }

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
        <TeamScoreRow teamName={game.away_team} score={game.away_score} teamId={game.away_team_id} />
        <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 700 }}>vs</p>
        </div>
        <TeamScoreRow teamName={game.home_team} score={game.home_score} teamId={game.home_team_id} />
      </div>

      {showPrediction && (
        <div className="prediction-badge">
          <p className="prediction-badge-label">
            {shortTeamName(predictedTeamFull)} favored
          </p>
          {prediction.rationale && (
            <p className="prediction-badge-rationale">{prediction.rationale}</p>
          )}
          <button
            type="button"
            className="prediction-badge-btn"
            onClick={() => setAskOpen(true)}
          >
            Ask why?
          </button>
        </div>
      )}

      <button
        type="button"
        className="live-chat-open-btn"
        onClick={() => setChatOpen(true)}
      >
        {isLive ? 'Join live chat' : 'Open chat'}
      </button>

      {isAdmin && (
        <button
          type="button"
          className="game-card-admin-delete"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete (admin)'}
        </button>
      )}

      {askOpen && prediction && (
        <AskAboutPredictionModal
          gameId={game.game_id}
          homeTeam={game.home_team}
          awayTeam={game.away_team}
          prediction={prediction}
          onClose={() => setAskOpen(false)}
        />
      )}

      {chatOpen && (
        <LiveChatModal
          gameId={game.game_id}
          homeTeam={game.home_team}
          awayTeam={game.away_team}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}

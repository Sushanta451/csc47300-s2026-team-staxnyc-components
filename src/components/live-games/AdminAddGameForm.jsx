import { useState } from 'react'
import { addLiveGame } from '../../lib/api'

export default function AdminAddGameForm({ onAdded }) {
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [gameDate, setGameDate] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  // Build a unique game_id so it never collides with the ESPN IDs the
  // Azure scraper writes. The "admin-" prefix makes the source obvious.
  function makeId() {
    return 'admin-' + Date.now()
  }

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setMsg({ kind: 'err', text: 'Home and away team are required' })
      return
    }
    setSaving(true)
    try {
      const row = {
        game_id: makeId(),
        home_team: homeTeam.trim(),
        away_team: awayTeam.trim(),
        status,
        home_score: homeScore === '' ? 0 : Number(homeScore),
        away_score: awayScore === '' ? 0 : Number(awayScore),
        game_date: gameDate ? new Date(gameDate).toISOString() : new Date().toISOString(),
      }
      await addLiveGame(row)
      setMsg({ kind: 'ok', text: `Added ${row.away_team} at ${row.home_team}` })
      setHomeTeam('')
      setAwayTeam('')
      setHomeScore('')
      setAwayScore('')
      setGameDate('')
      setStatus('scheduled')
      if (onAdded) onAdded()
    } catch (err) {
      setMsg({ kind: 'err', text: err.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card panel admin-add-game" style={{ marginBottom: '1.5rem' }}>
      <h3>Add a game (admin)</h3>
      <form onSubmit={submit} className="admin-add-game-grid">
        <label className="admin-add-game-field">
          <span className="admin-add-game-label">Away team</span>
          <input
            className="search-input"
            type="text"
            placeholder="e.g. New York Knicks"
            value={awayTeam}
            onChange={e => setAwayTeam(e.target.value)}
            disabled={saving}
          />
        </label>

        <label className="admin-add-game-field">
          <span className="admin-add-game-label">Home team</span>
          <input
            className="search-input"
            type="text"
            placeholder="e.g. Cleveland Cavaliers"
            value={homeTeam}
            onChange={e => setHomeTeam(e.target.value)}
            disabled={saving}
          />
        </label>

        <label className="admin-add-game-field">
          <span className="admin-add-game-label">Status</span>
          <select
            className="search-input"
            value={status}
            onChange={e => setStatus(e.target.value)}
            disabled={saving}
          >
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="final">final</option>
          </select>
        </label>

        <label className="admin-add-game-field">
          <span className="admin-add-game-label">Tip-off</span>
          <input
            className="search-input"
            type="datetime-local"
            value={gameDate}
            onChange={e => setGameDate(e.target.value)}
            disabled={saving}
          />
        </label>

        <label className="admin-add-game-field">
          <span className="admin-add-game-label">Away score</span>
          <input
            className="search-input"
            type="number"
            min="0"
            placeholder="0"
            value={awayScore}
            onChange={e => setAwayScore(e.target.value)}
            disabled={saving}
          />
        </label>

        <label className="admin-add-game-field">
          <span className="admin-add-game-label">Home score</span>
          <input
            className="search-input"
            type="number"
            min="0"
            placeholder="0"
            value={homeScore}
            onChange={e => setHomeScore(e.target.value)}
            disabled={saving}
          />
        </label>

        <div className="admin-add-game-actions">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add game'}
          </button>
          {msg && (
            <span className={msg.kind === 'ok' ? 'admin-add-game-ok' : 'admin-add-game-err'}>
              {msg.text}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getLiveGames, upsertHighlight } from '../../lib/api'

function parseYouTubeId(input) {
  const s = String(input || '').trim()
  if (!s) return ''
  // Already a bare id (11 chars, [A-Za-z0-9_-])
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    // youtu.be/<id>
    if (u.hostname.endsWith('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id.slice(0, 11)
    }
    // youtube.com/watch?v=<id>
    const v = u.searchParams.get('v')
    if (v) return v.slice(0, 11)
    // youtube.com/embed/<id> or youtube.com/shorts/<id>
    const m = u.pathname.match(/\/(embed|shorts)\/([A-Za-z0-9_-]{11})/)
    if (m) return m[2]
  } catch {
    // not a URL
  }
  return ''
}

export default function AdminHighlightForm({ onSaved }) {
  const [games, setGames] = useState([])
  const [gameId, setGameId] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString()
    getLiveGames(from, to).then(setGames).catch(() => setGames([]))
  }, [])

  const selected = games.find(g => String(g.game_id) === String(gameId))
  const videoId = parseYouTubeId(url)
  const canSave = !!selected && !!videoId && !!title.trim() && !saving

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    if (!canSave) return
    setSaving(true)
    try {
      await upsertHighlight({
        game_id: String(selected.game_id),
        home_team: selected.home_team,
        away_team: selected.away_team,
        youtube_video_id: videoId,
        video_title: title.trim(),
        thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      })
      setOk(`Saved highlight for ${selected.away_team} at ${selected.home_team}`)
      setUrl('')
      setTitle('')
      setGameId('')
      onSaved?.()
    } catch (err) {
      setError(err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card panel admin-highlight-form" style={{ marginBottom: '1.5rem' }}>
      <h3>Add or replace a highlight (admin)</h3>
      <form onSubmit={submit} className="admin-hl-grid">
        <label className="admin-hl-field">
          <span className="admin-hl-label">Game</span>
          <select
            className="search-input"
            value={gameId}
            onChange={e => setGameId(e.target.value)}
            disabled={saving}
          >
            <option value="">Select a game...</option>
            {games.map(g => (
              <option key={g.game_id} value={g.game_id}>
                {g.away_team} at {g.home_team} - {(g.status || '').toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-hl-field">
          <span className="admin-hl-label">YouTube URL or ID</span>
          <input
            className="search-input"
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={saving}
          />
          {url && !videoId && (
            <span className="admin-hl-warn">Could not parse a video ID from that.</span>
          )}
        </label>

        <label className="admin-hl-field admin-hl-field-wide">
          <span className="admin-hl-label">Video title</span>
          <input
            className="search-input"
            type="text"
            placeholder="e.g. CAVALIERS at PISTONS | FULL GAME HIGHLIGHTS"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={saving}
          />
        </label>

        <div className="admin-hl-actions">
          <button type="submit" className="btn primary" disabled={!canSave}>
            {saving ? 'Saving...' : 'Save highlight'}
          </button>
          {ok && <span className="admin-hl-ok">{ok}</span>}
          {error && <span className="admin-hl-err">{error}</span>}
        </div>
      </form>
    </div>
  )
}

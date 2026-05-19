import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { deleteHighlight } from '../../lib/api'

export default function HighlightCard({ highlight, index = 0, onDelete }) {
  const { isAdmin } = useAuth()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (busy) return
    if (!window.confirm(`Delete highlight for ${highlight.away_team} vs ${highlight.home_team}?`)) return
    setBusy(true)
    try {
      await deleteHighlight(highlight.game_id)
      onDelete?.(highlight.game_id)
    } catch (e) {
      window.alert('Delete failed: ' + (e?.message || 'unknown'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="card highlight-card card-pop-in"
      style={{ '--card-pop-delay': `${Math.min(index * 0.09, 0.9)}s` }}
    >
      <div className="highlight-video">
        <iframe
          src={`https://www.youtube.com/embed/${highlight.youtube_video_id}`}
          title={highlight.video_title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="highlight-info">
        <h3 className="highlight-teams">{highlight.away_team} vs {highlight.home_team}</h3>
        <p className="highlight-title">{highlight.video_title}</p>
        {isAdmin && (
          <button
            type="button"
            className="highlight-admin-delete"
            onClick={handleDelete}
            disabled={busy}
          >
            {busy ? 'Deleting...' : 'Delete (admin)'}
          </button>
        )}
      </div>
    </div>
  )
}

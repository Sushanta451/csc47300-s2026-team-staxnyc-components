import { useCallback, useEffect, useState } from 'react'
import HighlightCard from '../components/highlights/HighlightCard'
import AdminHighlightForm from '../components/highlights/AdminHighlightForm'
import { useAuth } from '../lib/AuthContext'
import { getGameHighlights } from '../lib/api'
import './HighlightsPage.css'

export default function HighlightsPage() {
  const { isAdmin } = useAuth()
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await getGameHighlights(20)
    if (data) setHighlights(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleDeleted = (gameId) => {
    setHighlights(prev => prev.filter(h => String(h.game_id) !== String(gameId)))
  }

  if (loading) return (
    <main className="container">
      <p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>Loading highlights...</p>
    </main>
  )

  return (
    <main className="container">
      <section className="page-header">
        <p className="breadcrumb">League / <span>Highlights</span></p>
      </section>

      <div className="highlights-intro card-pop-in" style={{ marginBottom: '1.5rem', '--card-pop-delay': '0s' }}>
        <h1 style={{ fontSize: 'clamp(1.25rem,2.3vw,1.65rem)', fontWeight: 800, marginBottom: '0.3rem' }}>
          Game Highlights
        </h1>
      </div>

      {isAdmin && <AdminHighlightForm onSaved={refresh} />}

      {highlights.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>No highlights available yet. Check back after tonight's games!</p>
        </div>
      ) : (
        <div className="highlights-grid">
          {highlights.map((h, i) => (
            <HighlightCard key={h.game_id} highlight={h} index={i} onDelete={handleDeleted} />
          ))}
        </div>
      )}

      <footer className="footer">StaxNYC Predictor &bull; Highlights</footer>
    </main>
  )
}

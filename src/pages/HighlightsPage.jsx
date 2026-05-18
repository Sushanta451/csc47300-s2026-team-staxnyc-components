import { useEffect, useState } from 'react'
import HighlightCard from '../components/highlights/HighlightCard'
import { getGameHighlights } from '../lib/api'
import './HighlightsPage.css'

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getGameHighlights(20)
      if (data) setHighlights(data)
      setLoading(false)
    }
    load()
  }, [])

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

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.25rem,2.3vw,1.65rem)', fontWeight: 800, marginBottom: '0.3rem' }}>
          Game Highlights
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Automatically pulled from the NBA YouTube channel after each game
        </p>
      </div>

      {highlights.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>No highlights available yet. Check back after tonight's games!</p>
        </div>
      ) : (
        <div className="highlights-grid">
          {highlights.map(h => <HighlightCard key={h.game_id} highlight={h} />)}
        </div>
      )}

      <footer className="footer">StaxNYC Predictor &bull; Highlights</footer>
    </main>
  )
}

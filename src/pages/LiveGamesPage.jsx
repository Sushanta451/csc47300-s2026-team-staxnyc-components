import { useEffect, useState } from 'react'
import GameCard from '../components/live-games/GameCard'
import { getLiveGames } from '../lib/api'

export default function LiveGamesPage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  async function loadGames() {
    try {
      const today = new Date()
      const todayStr = today.toISOString().slice(0, 10)
      const dayAfter = new Date(today)
      dayAfter.setDate(dayAfter.getDate() + 2)
      const endStr = dayAfter.toISOString().slice(0, 10)
      const data = await getLiveGames(todayStr, endStr)
      setGames(data || [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      setLastUpdated(new Date().toLocaleTimeString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
    const interval = setInterval(loadGames, 10000)
    return () => clearInterval(interval)
  }, [])

  const liveGames = games.filter(g => (g.status || '').toLowerCase() === 'live')
  const finalGames = games.filter(g => (g.status || '').toLowerCase() === 'final')
  const scheduledGames = games.filter(g => (g.status || '').toLowerCase() === 'scheduled')

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) return (
    <main className="container">
      <p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>Loading live games...</p>
    </main>
  )

  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }

  return (
    <main className="container">
      <section className="page-header">
        <p className="breadcrumb">League / <span>Live Games</span></p>
      </section>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.25rem,2.3vw,1.65rem)', fontWeight: 800, marginBottom: '0.3rem' }}>Today's Games</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{dateStr}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastUpdated && <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Updated {lastUpdated}</span>}
          <button onClick={loadGames} className="btn primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Refresh</button>
        </div>
      </div>

      {liveGames.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Live Now</h2>
          <div style={grid}>{liveGames.map(g => <GameCard key={g.game_id} game={g} />)}</div>
        </section>
      )}

      {scheduledGames.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Scheduled</h2>
          <div style={grid}>{scheduledGames.map(g => <GameCard key={g.game_id} game={g} />)}</div>
        </section>
      )}

      {finalGames.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Final</h2>
          <div style={grid}>{finalGames.map(g => <GameCard key={g.game_id} game={g} />)}</div>
        </section>
      )}

      {games.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>No games scheduled for today.</p>
        </div>
      )}

      <footer className="footer">StaxNYC Predictor - Live Games</footer>
    </main>
  )
}

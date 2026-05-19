import { useEffect, useState } from 'react'
import GameCard from '../components/live-games/GameCard'
import { getLiveGames, getPredictionsByGameIds } from '../lib/api'

export default function LiveGamesPage() {
  const [games, setGames] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  async function loadGames() {
    try {
      const now = new Date()
      const startLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
      const data = await getLiveGames(startLocal.toISOString(), endLocal.toISOString())
      const list = data || []
      setGames(list)
      const scheduledIds = list
        .filter(g => (g.status || '').toLowerCase() === 'scheduled' || (g.status || '').toLowerCase() === 'live')
        .map(g => g.game_id)
      const preds = await getPredictionsByGameIds(scheduledIds)
      setPredictions(preds)
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

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000
  const tomorrowEnd = todayEnd + 24 * 60 * 60 * 1000

  function isOn(g, startMs, endMs) {
    const t = new Date(g.game_date).getTime()
    return t >= startMs && t < endMs
  }

  const liveGames = games.filter(g => (g.status || '').toLowerCase() === 'live')
  const finalGames = games.filter(g => (g.status || '').toLowerCase() === 'final')
  const scheduledToday = games.filter(g => (g.status || '').toLowerCase() === 'scheduled' && isOn(g, todayStart, todayEnd))
  const scheduledTomorrow = games.filter(g => (g.status || '').toLowerCase() === 'scheduled' && isOn(g, todayEnd, tomorrowEnd))

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const tomorrowDateStr = new Date(todayEnd).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

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
          <div style={grid}>{liveGames.map(g => <GameCard key={g.game_id} game={g} prediction={predictions[g.game_id]} onDelete={(id) => setGames(prev => prev.filter(x => x.game_id !== id))} />)}</div>
        </section>
      )}

      {scheduledToday.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Today</h2>
          <div style={grid}>{scheduledToday.map(g => <GameCard key={g.game_id} game={g} prediction={predictions[g.game_id]} onDelete={(id) => setGames(prev => prev.filter(x => x.game_id !== id))} />)}</div>
        </section>
      )}

      {scheduledTomorrow.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted-2)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Tomorrow &middot; {tomorrowDateStr}</h2>
          <div style={grid}>{scheduledTomorrow.map(g => <GameCard key={g.game_id} game={g} prediction={predictions[g.game_id]} onDelete={(id) => setGames(prev => prev.filter(x => x.game_id !== id))} />)}</div>
        </section>
      )}

      {finalGames.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Final</h2>
          <div style={grid}>{finalGames.map(g => <GameCard key={g.game_id} game={g} prediction={predictions[g.game_id]} onDelete={(id) => setGames(prev => prev.filter(x => x.game_id !== id))} />)}</div>
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

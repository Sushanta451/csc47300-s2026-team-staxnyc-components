import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PlayerHeader from '../components/player/PlayerHeader'
import RecentGamesTable from '../components/player/RecentGamesTable'
import PointsTrendChart from '../components/player/PointsTrendChart'
import PredictionCard from '../components/player/PredictionCard'
import { getPlayerById, getPlayerGames } from '../lib/api'

export default function PlayerPage() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, g] = await Promise.all([
          getPlayerById(id),
          getPlayerGames(id, 5),
        ])
        if (s) setStats(s)
        if (g) setGames(g)
      } catch (err) {
        console.log('Error loading player:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <main className="container">
      <p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>Loading...</p>
    </main>
  )

  if (!stats) return (
    <main className="container">
      <p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>
        Player not found. <Link to="/">Go home</Link>
      </p>
    </main>
  )

  return (
    <main className="container">
      <section className="page-header">
        <p className="breadcrumb">
          <Link to="/" style={{ color: 'var(--muted)' }}>Players</Link> / <span>{stats.player_name}</span>
        </p>
      </section>

      <section className="profile-layout">
        <PlayerHeader stats={stats} />

        <aside className="side-stack">
          <PredictionCard prediction={null} />
          <section className="card panel">
            <h3>Season Stats</h3>
            <div className="matchup-list">
              {[
                { title: 'Points Per Game', value: stats.ppg },
                { title: 'Rebounds Per Game', value: stats.rpg },
                { title: 'Assists Per Game', value: stats.apg },
                { title: 'Field Goal %', value: stats.fg_pct + '%' },
              ].map((item, i) => (
                <div key={i} className="matchup-item">
                  <p className="matchup-title">{item.title}</p>
                  <span className="pill">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      {games.length > 0 && (
        <section className="lower-grid">
          <PointsTrendChart games={games} avgPpg={stats.ppg} />
          <RecentGamesTable games={games} />
        </section>
      )}

      <footer className="footer">{stats.player_name} Player Profile</footer>
    </main>
  )
}

import { useState, useMemo } from 'react'
import standingsData from '../data/standings'
import ConferenceFilter from '../components/standings/ConferenceFilter'
import StandingsTable from '../components/standings/StandingsTable'

export default function StandingsPage() {
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => {
    let list = standingsData
    if (filter !== 'All') list = list.filter(r => r.conference === filter)
    return list.slice().sort((a, b) => {
      if (a.conference !== b.conference) return a.conference < b.conference ? -1 : 1
      if (a.rank !== b.rank) return a.rank - b.rank
      return b.pct - a.pct
    })
  }, [filter])

  return (
    <main className="container">
      <section className="page-header">
        <p className="breadcrumb">League / <span>Team Standings</span></p>
      </section>

      <section className="card panel" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem,2.3vw,1.65rem)', fontWeight: 800 }}>NBA Team Standings</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Conference standings</p>
          </div>
          <ConferenceFilter value={filter} onChange={setFilter} />
        </div>
      </section>

      <section className="card panel">
        <StandingsTable rows={filtered} />
      </section>

      <footer className="footer">StaxNYC Predictor - Standings</footer>
    </main>
  )
}

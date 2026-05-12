import { useEffect, useMemo, useState } from 'react'
import standingsData from '../data/standings'
import ConferenceFilter from '../components/standings/ConferenceFilter'
import StandingsTable from '../components/standings/StandingsTable'
import { getStandings } from '../lib/api'

function sortStandingsRows(list) {
  return list.slice().sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    return b.pct - a.pct
  })
}

export default function StandingsPage() {
  const [filter, setFilter] = useState('All')
  const [standingsRows, setStandingsRows] = useState(standingsData)

  useEffect(() => {
    let alive = true
    getStandings().then((rows) => {
      if (alive && rows?.length) setStandingsRows(rows)
    })
    return () => { alive = false }
  }, [])

  const eastRows = useMemo(
    () => sortStandingsRows(standingsRows.filter((r) => r.conference === 'East')),
    [standingsRows],
  )
  const westRows = useMemo(
    () => sortStandingsRows(standingsRows.filter((r) => r.conference === 'West')),
    [standingsRows],
  )

  const filtered = useMemo(() => {
    if (filter === 'All') return standingsRows
    return sortStandingsRows(standingsRows.filter((r) => r.conference === filter))
  }, [filter, standingsRows])

  return (
    <main className="container">
      <section className="page-header">
        <p className="breadcrumb">League / <span>Team Standings</span></p>
      </section>

      <section className="card panel" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem,2.3vw,1.65rem)', fontWeight: 800 }}>NBA Team Standings</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Eastern and Western conferences</p>
          </div>
          <ConferenceFilter value={filter} onChange={setFilter} />
        </div>
      </section>

      {filter === 'All' ? (
        <>
          <section className="card panel standings-conf-block">
            <h2 className="standings-conf-title">Eastern Conference</h2>
            <StandingsTable rows={eastRows} hideConferenceLink />
          </section>
          <section className="card panel standings-conf-block" style={{ marginTop: '1rem' }}>
            <h2 className="standings-conf-title">Western Conference</h2>
            <StandingsTable rows={westRows} hideConferenceLink />
          </section>
        </>
      ) : (
        <section className="card panel standings-conf-block">
          <h2 className="standings-conf-title">{filter === 'East' ? 'Eastern' : 'Western'} Conference</h2>
          <StandingsTable rows={filtered} hideConferenceLink />
        </section>
      )}

      <footer className="footer">StaxNYC Predictor - Standings</footer>
    </main>
  )
}

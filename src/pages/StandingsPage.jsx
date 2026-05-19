import { useEffect, useMemo, useState } from 'react'
import standingsData from '../data/standings'
import ConferenceFilter from '../components/standings/ConferenceFilter'
import StandingsTable from '../components/standings/StandingsTable'
import { getStandings } from '../lib/api'

function sortRows(list) {
  return list.slice().sort((a, b) => a.rank !== b.rank ? a.rank - b.rank : b.pct - a.pct)
}

function AnimatedNumber({ target, delay = 0 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf, start
    const t = setTimeout(() => {
      function step(ts) {
        if (!start) start = ts
        const p = Math.min((ts - start) / 800, 1)
        const e = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(target * e))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [target, delay])
  return <>{val}</>
}

function StatCard({ label, value, sub, color, delay, icon }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '0.9rem 1.1rem',
        borderRadius: 14,
        background: hov ? `${color}12` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? color + '40' : 'rgba(255,255,255,0.08)'}`,
        animation: `statIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both ${delay}ms`,
        transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov ? `0 12px 28px ${color}22` : 'none',
        cursor: 'default', flex: 1, minWidth: 100,
      }}
    >
      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
        <AnimatedNumber target={typeof value === 'number' ? value : 0} delay={delay + 100} />
        {typeof value !== 'number' && value}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.68rem', color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

export default function StandingsPage() {
  const [filter, setFilter]   = useState('All')
  const [rows, setRows]       = useState(standingsData)
  const [filterKey, setFilterKey] = useState(0)

  useEffect(() => {
    let alive = true
    getStandings().then(r => { if (alive && r?.length) setRows(r) })
    return () => { alive = false }
  }, [])

  function handleFilter(v) { setFilter(v); setFilterKey(k => k + 1) }

  const eastRows = useMemo(() => sortRows(rows.filter(r => r.conference === 'East')), [rows])
  const westRows = useMemo(() => sortRows(rows.filter(r => r.conference === 'West')), [rows])
  const filtered = useMemo(() => filter === 'All' ? rows : sortRows(rows.filter(r => r.conference === filter)), [filter, rows])

  const topEast    = eastRows[0]
  const topWest    = westRows[0]
  const hotStreak  = [...eastRows, ...westRows].filter(r => r.streak?.startsWith('W') && parseInt(r.streak.slice(1)) >= 3)
  const bestRecord = [...eastRows, ...westRows].reduce((best, r) => (!best || r.wins > best.wins) ? r : best, null)

  return (
    <>
      <style>{`
        @keyframes statIn {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes courtSweep {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes confIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ballSpin {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-6px) rotate(180deg); }
        }
        @keyframes shine {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
      `}</style>

      <main className="container">

        <section className="page-header" style={{ animation: 'pageIn 0.4s ease both' }}>
          <p className="breadcrumb">League / <span>Team Standings</span></p>
        </section>

        <div style={{
          display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
          marginBottom: '1rem',
          animation: 'pageIn 0.5s ease both 0.05s',
        }}>
          <StatCard icon="" label="Teams" value={rows.length} color="var(--accent)" delay={100} />
          <StatCard icon="" label="Hot streaks" value={hotStreak.length} color="var(--warning, #f59e0b)"
            sub={hotStreak.length > 0 ? hotStreak[0].team.split(' ').slice(-1)[0] + ' leads' : ''}
            delay={180} />
          <StatCard icon="" label="Best record" value={bestRecord ? `${bestRecord.wins}W` : '—'}
            sub={bestRecord?.team.split(' ').slice(-1)[0]}
            color="var(--success)" delay={260} />
          {topEast && (
            <StatCard icon="" label="East leader" value={topEast.team.split(' ').slice(-1)[0]}
              sub={`${topEast.wins}–${topEast.losses}`}
              color="var(--accent)" delay={340} />
          )}
          {topWest && (
            <StatCard icon="" label="West leader" value={topWest.team.split(' ').slice(-1)[0]}
              sub={`${topWest.wins}–${topWest.losses}`}
              color="#7c5cff" delay={420} />
          )}
        </div>

        <section className="card panel" style={{
          marginBottom: '1rem',
          animation: 'pageIn 0.5s cubic-bezier(0.22,1,0.36,1) both 0.1s',
          position: 'relative', overflow: 'hidden',
        }}>
          <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.04, pointerEvents: 'none' }}
            width="200" height="120" viewBox="0 0 200 120">
            <path d="M 200 120 Q 100 -20 0 120" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="100" cy="40" r="30" fill="none" stroke="white" strokeWidth="1.5"/>
          </svg>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.25rem,2.3vw,1.65rem)', fontWeight: 800 }}>NBA Team Standings</h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                Eastern and Western conferences · 2024–25 Season
              </p>
            </div>
            <ConferenceFilter value={filter} onChange={handleFilter} />
          </div>
        </section>

        <div style={{
          height: 2, margin: '0 0 1rem', borderRadius: 999,
          background: 'linear-gradient(90deg,transparent,rgba(91,140,255,0.6) 20%,rgba(124,92,255,0.6) 50%,rgba(91,140,255,0.6) 80%,transparent)',
          animation: 'courtSweep 0.8s cubic-bezier(0.22,1,0.36,1) both 0.18s',
          transformOrigin: 'left',
        }} />

        <div key={filterKey}>
          {filter === 'All' ? (
            <>
              <section className="card panel standings-conf-block" style={{
                animation: 'confIn 0.5s cubic-bezier(0.22,1,0.36,1) both 0ms',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,140,255,0.08), transparent)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', position: 'relative' }}>
                  <span style={{
                    padding: '0.28rem 0.75rem', borderRadius: 999,
                    background: 'rgba(79,140,255,0.15)', color: 'var(--accent)',
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    animation: 'badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both 0.15s',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    East
                    <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', animation: 'shine 0.8s ease both 0.3s', pointerEvents: 'none' }} />
                  </span>
                  <h2 className="standings-conf-title" style={{ margin: 0 }}>Eastern Conference</h2>
                  {topEast && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      Leader: <strong style={{ color: 'var(--accent)' }}>{topEast.wins}–{topEast.losses}</strong>
                    </span>
                  )}
                </div>
                <StandingsTable rows={eastRows} hideConferenceLink />
              </section>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.2rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(79,140,255,0.35), transparent)' }} />
                <span style={{ fontSize: '1.4rem', animation: 'ballSpin 2.5s ease-in-out infinite' }}></span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, rgba(124,92,255,0.35), transparent)' }} />
              </div>

              <section className="card panel standings-conf-block" style={{
                marginTop: 0,
                animation: 'confIn 0.55s cubic-bezier(0.22,1,0.36,1) both 0.12s',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,255,0.08), transparent)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', position: 'relative' }}>
                  <span style={{
                    padding: '0.28rem 0.75rem', borderRadius: 999,
                    background: 'rgba(124,92,255,0.15)', color: '#7c5cff',
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    animation: 'badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both 0.28s',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    West
                    <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', animation: 'shine 0.8s ease both 0.45s', pointerEvents: 'none' }} />
                  </span>
                  <h2 className="standings-conf-title" style={{ margin: 0 }}>Western Conference</h2>
                  {topWest && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      Leader: <strong style={{ color: '#7c5cff' }}>{topWest.wins}–{topWest.losses}</strong>
                    </span>
                  )}
                </div>
                <StandingsTable rows={westRows} hideConferenceLink />
              </section>
            </>
          ) : (
            <section className="card panel standings-conf-block" style={{
              animation: 'confIn 0.5s cubic-bezier(0.22,1,0.36,1) both 0ms',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <span style={{
                  padding: '0.28rem 0.75rem', borderRadius: 999,
                  background: `rgba(${filter === 'East' ? '79,140,255' : '124,92,255'},0.15)`,
                  color: filter === 'East' ? 'var(--accent)' : '#7c5cff',
                  fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  animation: 'badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both 0.1s',
                }}>{filter}</span>
                <h2 className="standings-conf-title" style={{ margin: 0 }}>
                  {filter === 'East' ? 'Eastern' : 'Western'} Conference
                </h2>
              </div>
              <StandingsTable rows={filtered} hideConferenceLink />
            </section>
          )}
        </div>

        <footer className="footer" style={{ animation: 'pageIn 0.5s ease both 0.5s' }}>
          StaxNYC Predictor — Standings
        </footer>
      </main>
    </>
  )
}

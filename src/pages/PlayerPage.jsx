import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import PlayerHeader from '../components/player/PlayerHeader'
import RecentGamesTable from '../components/player/RecentGamesTable'
import PointsTrendChart from '../components/player/PointsTrendChart'
import PredictionCard from '../components/player/PredictionCard'
import { getPlayerById, getPlayerGames } from '../lib/api'
import { getTeamBranding } from '../lib/teamBranding'

function useScrollReveal(ready) {
  useEffect(() => {
    if (!ready) return
    const style = document.createElement('style')
    style.id = 'scroll-reveal-styles'
    if (!document.getElementById('scroll-reveal-styles')) {
      style.textContent = `
        [data-scroll] {
          opacity: 0;
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1),
                      transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        [data-scroll="up"]    { transform: translateY(50px); }
        [data-scroll="left"]  { transform: translateX(-50px); }
        [data-scroll="right"] { transform: translateX(50px); }
        [data-scroll="scale"] { transform: scale(0.85); }
        [data-scroll].visible {
          opacity: 1 !important;
          transform: none !important;
        }
      `
      document.head.appendChild(style)
    }

    const els = document.querySelectorAll('[data-scroll]')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.scrollDelay || 0
          setTimeout(() => e.target.classList.add('visible'), delay)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })

    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [ready])
}

export default function PlayerPage() {
  const { id } = useParams()
  const [stats,   setStats]   = useState(null)
  const [games,   setGames]   = useState([])
  const [loading, setLoading] = useState(true)
  const [ready,   setReady]   = useState(false)

  useScrollReveal(ready)

  useEffect(() => {
    setReady(false)
    setStats(null)
    setGames([])
    setLoading(true)

    async function load() {
      try {
        const [s, g] = await Promise.all([
          getPlayerById(id),
          getPlayerGames(id, 15),
        ])
        if (s) setStats(s)
        if (g) setGames(g)
      } catch (err) {
        console.error('Error loading player:', err)
      } finally {
        setLoading(false)
        setTimeout(() => setReady(true), 120)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <main className="container">
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
      `}</style>
      <div style={{ padding: '5rem 0', display: 'grid', gap: '1rem' }}>
        {[300, 200, 200].map((h, i) => (
          <div key={i} style={{
            height: h, borderRadius: 16,
            background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)',
            backgroundSize: '600px 100%',
            animation: `skeletonShimmer 1.5s ease infinite ${i * 0.15}s`,
          }} />
        ))}
      </div>
    </main>
  )

  if (!stats) return (
    <main className="container">
      <p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>
        Player not found. <Link to="/" style={{ color: 'var(--accent)' }}>Go home</Link>
      </p>
    </main>
  )

  const branding  = getTeamBranding(stats.team)
  const teamColor = branding?.color || 'var(--accent)'

  return (
    <>
      <style>{`
        @keyframes teamFlash {
          0%   { opacity: 0.4; }
          100% { opacity: 0; }
        }
        @keyframes breadcrumbIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes courtSweep {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 30%, ${teamColor}88, transparent 65%)`,
        animation: 'teamFlash 0.9s ease forwards',
      }} />

      <main className="container">
        <section className="page-header" style={{ animation: 'breadcrumbIn 0.45s ease both 0.1s' }}>
          <p className="breadcrumb">
            <Link to="/" style={{ color: 'var(--muted)' }}>Players</Link>
            {' / '}
            <span style={{ color: teamColor, fontWeight: 600 }}>{stats.player_name}</span>
          </p>
        </section>

        <div style={{
          height: 2, marginBottom: '1rem', borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${teamColor}88 20%, ${teamColor} 50%, ${teamColor}88 80%, transparent)`,
          animation: 'courtSweep 0.7s cubic-bezier(0.22,1,0.36,1) both 0.2s',
          transformOrigin: 'left',
        }} />

        <section
          className="profile-layout"
          data-scroll="up"
          data-scroll-delay="50"
        >
          <PlayerHeader stats={stats} />
          <aside className="side-stack" data-scroll="right" data-scroll-delay="150">
            <PredictionCard stats={stats} recentGames={games} />
          </aside>
        </section>

        {games.length > 0 && (
          <section className="lower-grid" style={{ marginBottom: '2rem' }}>
            <div data-scroll="left" data-scroll-delay="0">
              <PointsTrendChart games={games} avgPpg={stats.ppg} />
            </div>
            <div data-scroll="right" data-scroll-delay="100">
              <RecentGamesTable games={games.slice(0, 10)} />
            </div>
          </section>
        )}

        <footer className="footer" data-scroll="up" data-scroll-delay="200">
          {stats.player_name} · {stats.team}
        </footer>
      </main>
    </>
  )
}

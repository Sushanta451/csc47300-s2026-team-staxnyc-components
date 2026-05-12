import { useEffect, useRef, useState } from 'react'
import PlayerSearchBar from '../components/search/PlayerSearchBar'
import FeaturedPlayerCard from '../components/home/FeaturedPlayerCard'
import { getActiveFeaturedPlayers, getLiveGames } from '../lib/api'

function useScrollReveal(ref) {
  useEffect(() => {
    if (!ref.current) return
    const els = ref.current.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [ref])
}

export default function HomePage() {
  const [featured,  setFeatured]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [liveCount, setLiveCount] = useState(null)
  const pageRef = useRef(null)
  useScrollReveal(pageRef)

  useEffect(() => {
    async function load() {
      try {
        const players = await getActiveFeaturedPlayers()
        setFeatured(players)  // pass raw Supabase objects — no image mapping needed
      } catch (err) {
        console.error('Featured players failed to load:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadGames() {
      try {
        const today  = new Date().toISOString().slice(0, 10)
        const tmr    = new Date(); tmr.setDate(tmr.getDate() + 1)
        const tmrStr = tmr.toISOString().slice(0, 10)
        const games  = await getLiveGames(today, tmrStr)
        setLiveCount(games?.length ?? 0)
      } catch { /* ignore */ }
    }
    loadGames()
  }, [])

  return (
    <main className="container" ref={pageRef}>
      <section className="hero">
        <div className="hero-card" style={{ paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                             background: 'var(--success)', boxShadow: '0 0 8px var(--success)',
                             animation: 'pulse-online 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)',
                             fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {liveCount === null ? 'Checking games…' : liveCount === 0 ? 'No games today' : `${liveCount} game${liveCount !== 1 ? 's' : ''} today`}
              </span>
            </div>
            <div style={{ height: 16, width: 1, background: 'var(--panel-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>2024–25 Season</span>
          </div>
          <h1 className="reveal">NBA Player <span className="gradient-text">Performance</span><br />Predictor</h1>
          <p className="reveal reveal-delay-1" style={{ marginTop: '0.55rem', marginBottom: 0 }}>
            Search players, compare stats, track live games, and follow standings.
          </p>
          <div className="reveal reveal-delay-2"><PlayerSearchBar /></div>
        </div>
      </section>

      <div className="reveal" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', margin: '1rem 0 0' }}>
        {[{ label: '🔴  Live Games', href: '/live-games' },
          { label: '🏆  Standings',  href: '/standings'  },
          { label: '⚡  Compare',   href: '/compare'    },
          { label: '🎥  Highlights', href: '/highlights' }].map(({ label, href }) => (
          <a key={href} href={href} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem',
            borderRadius: '999px', border: '1px solid var(--panel-border)', background: 'var(--panel)',
            color: 'var(--muted-2)', fontSize: '0.82rem', fontWeight: 600,
            transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.35)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; e.currentTarget.style.transform = '' }}
          >{label}</a>
        ))}
      </div>

      <section id="players" className="players-section" style={{ paddingTop: '2rem' }}>
        <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
            <h2 className="section-title-home" style={{ margin: 0 }}>Featured Players</h2>
          </div>
          <a href="/compare" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)' }}>Compare players →</a>
        </div>

        {loading ? (
          <div className="player-grid">
            {[0,1,2,3].map((i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 230 }} />
                <div style={{ padding: '1rem' }}>
                  <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 34, borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>
            No featured players yet. An admin can add some from the <a href="/admin" style={{ color: 'var(--accent)' }}>Admin page</a>.
          </p>
        ) : (
          <div className="player-grid">
            {featured.map((player, i) => (
              <div key={player.player_id} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <FeaturedPlayerCard player={player} />
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">StaxNYC Predictor</footer>
    </main>
  )
}
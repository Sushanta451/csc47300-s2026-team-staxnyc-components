import { useEffect, useRef, useState } from 'react'
import PlayerSearchBar from '../components/search/PlayerSearchBar'
import FeaturedPlayerCard from '../components/home/FeaturedPlayerCard'
import WembyDunkOverlay from '../components/player/WembyDunkOverlay'
import { getActiveFeaturedPlayers, getLiveGames } from '../lib/api'
import { currentNbaSeasonSlug } from '../lib/nbaSeason'

function useScrollReveal(ref) {
  useEffect(() => {
    if (!ref.current) return
    const els = ref.current.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [ref])
}

function BballLoader() {
  return (
    <div style={{padding:'3rem 0',display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
      <div style={{position:'relative',width:60,height:60}}>
        <div style={{
          fontSize:'2.6rem', display:'inline-block',
          animation:'loaderBounce 0.65s cubic-bezier(0.215,0.61,0.355,1) infinite',
          filter:'drop-shadow(0 8px 12px rgba(0,0,0,0.5))',
        }}></div>
        <div style={{
          position:'absolute', bottom:-4, left:'50%', transform:'translateX(-50%)',
          width:32, height:8, borderRadius:'50%',
          background:'rgba(0,0,0,0.3)',
          filter:'blur(4px)',
          animation:'shadowPulse 0.65s ease infinite',
        }} />
      </div>
      <p style={{color:'var(--muted)',fontSize:'0.85rem',fontFamily:'var(--font-mono)',letterSpacing:'0.05em'}}>
        Loading roster…
      </p>
      <style>{`
        @keyframes loaderBounce {
          0%,100% { transform:translateY(0) scaleY(1); }
          40%     { transform:translateY(-24px) scaleY(1.05); }
          80%     { transform:translateY(0) scaleX(1.1) scaleY(0.9); }
        }
        @keyframes shadowPulse {
          0%,100% { transform:translateX(-50%) scale(1); opacity:0.3; }
          40%     { transform:translateX(-50%) scale(0.6); opacity:0.15; }
        }
      `}</style>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card" style={{overflow:'hidden'}}>
      <div style={{
        height:230,
        background:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)',
        backgroundSize:'600px 100%',
        animation:'shimmer 1.5s ease infinite',
      }} />
      <div style={{padding:'1rem',display:'grid',gap:10}}>
        <div style={{height:18,width:'58%',borderRadius:8,background:'rgba(255,255,255,0.06)',animation:'shimmer 1.5s ease infinite 0.1s'}} />
        <div style={{height:14,width:'38%',borderRadius:8,background:'rgba(255,255,255,0.04)',animation:'shimmer 1.5s ease infinite 0.2s'}} />
        <div style={{height:36,borderRadius:10,background:'rgba(255,255,255,0.06)',animation:'shimmer 1.5s ease infinite 0.3s'}} />
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
    </div>
  )
}

export default function HomePage() {
  const [featured,  setFeatured]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [liveCount, setLiveCount] = useState(null)
  const pageRef = useRef(null)

  const [showWemby] = useState(() => {
    if (typeof window === 'undefined') return false
    if (sessionStorage.getItem('wemby-splash-shown') === '1') return false
    sessionStorage.setItem('wemby-splash-shown', '1')
    return true
  })

  useScrollReveal(pageRef)

  useEffect(() => {
    async function load() {
      try {
        const players = await getActiveFeaturedPlayers()
        setFeatured(players)
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
        const now = new Date()
        const startLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        const games = await getLiveGames(startLocal.toISOString(), endLocal.toISOString())
        setLiveCount(games?.length ?? 0)
      } catch {}
    }
    loadGames()
  }, [])

  const quickLinks = [
    {label:'Live Games', href:'/live-games'},
    {label:'Standings',  href:'/standings'},
    {label:'Compare',    href:'/compare'},
    {label:'Highlights', href:'/highlights'},
  ]

  return (
    <>
      {showWemby && <WembyDunkOverlay />}
      <style>{`
        @keyframes heroEntry {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes courtSweep {
          from { transform:scaleX(0); opacity:0; }
          to   { transform:scaleX(1); opacity:1; }
        }
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.6; transform:scale(1.4); }
        }
        @keyframes quickLinkIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <main className="container" ref={pageRef} style={{position:'relative'}}>

        <div style={{
          position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
          opacity:0.025,
          backgroundImage:`
            repeating-linear-gradient(0deg,rgba(255,255,255,1) 0,rgba(255,255,255,1) 1px,transparent 1px,transparent 60px),
            repeating-linear-gradient(90deg,rgba(255,255,255,1) 0,rgba(255,255,255,1) 1px,transparent 1px,transparent 60px)
          `,
        }} />

        <section
          className="hero"
          aria-label="Hero"
          style={{animation:'heroEntry 0.6s cubic-bezier(0.22,1,0.36,1) both', position:'relative', zIndex:1}}
        >
          <div className="hero-card" style={{paddingBottom:'1.5rem', position:'relative', overflow:'hidden'}}>

            <div style={{display:'flex',alignItems:'center',gap:'1.5rem',marginBottom:'1.4rem',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.45rem'}}>
                <span style={{
                  display:'inline-block', width:7, height:7, borderRadius:'50%',
                  background:'var(--success)',
                  boxShadow:'0 0 8px var(--success)',
                  animation:'livePulse 2s ease-in-out infinite',
                }} />
                <span style={{fontSize:'0.75rem',fontWeight:700,color:'var(--success)',fontFamily:'var(--font-mono)',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                  {liveCount===null ? 'Checking games…' : liveCount===0 ? 'No games today' : `${liveCount} game${liveCount!==1?'s':''} today`}
                </span>
              </div>
              <div style={{height:16,width:1,background:'var(--panel-border)'}} />
              <span style={{fontSize:'0.75rem',color:'var(--muted)',fontFamily:'var(--font-mono)'}}>{currentNbaSeasonSlug()} Season</span>
            </div>

            <h1 className="reveal" style={{lineHeight:1.1}}>
              NBA Player{' '}
              <span className="gradient-text">Performance</span>
              <br />Predictor
            </h1>
            <p className="reveal reveal-delay-1" style={{marginTop:'0.55rem',marginBottom:0}}>
              Search players, compare stats, track live games, and follow standings — all in one place.
            </p>
            <div className="reveal reveal-delay-2"><PlayerSearchBar /></div>
          </div>
        </section>

        <div style={{
          height:2, margin:'1rem 0',
          borderRadius:999,
          background:'linear-gradient(90deg,transparent,rgba(91,140,255,0.55) 20%,rgba(124,92,255,0.55) 50%,rgba(91,140,255,0.55) 80%,transparent)',
          animation:'courtSweep 0.9s cubic-bezier(0.22,1,0.36,1) both 0.4s',
          transformOrigin:'left',
          position:'relative', zIndex:1,
        }} />

        <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',margin:'0 0 0',position:'relative',zIndex:1}}>
          {quickLinks.map(({label,href},i) => (
            <a
              key={href}
              href={href}
              style={{
                display:'inline-flex', alignItems:'center',
                padding:'0.5rem 1rem',
                borderRadius:999,
                border:'1px solid var(--panel-border)',
                background:'var(--panel)',
                color:'var(--muted)',
                fontSize:'0.82rem', fontWeight:600,
                textDecoration:'none',
                transition:'border-color 0.22s,color 0.22s,background 0.22s,transform 0.22s,box-shadow 0.22s',
                animation:`quickLinkIn 0.5s cubic-bezier(0.22,1,0.36,1) both ${0.5+i*0.07}s`,
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.borderColor='rgba(91,140,255,0.4)'
                e.currentTarget.style.color='var(--text)'
                e.currentTarget.style.background='rgba(91,140,255,0.08)'
                e.currentTarget.style.transform='translateY(-3px)'
                e.currentTarget.style.boxShadow='0 8px 20px rgba(91,140,255,0.2)'
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.borderColor=''
                e.currentTarget.style.color=''
                e.currentTarget.style.background=''
                e.currentTarget.style.transform=''
                e.currentTarget.style.boxShadow=''
              }}
            >
              {label}
            </a>
          ))}
        </div>

        <section
          id="players"
          className="players-section"
          aria-label="Featured players"
          style={{paddingTop:'2rem', position:'relative', zIndex:1}}
        >
          <div className="reveal" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',gap:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
              <span style={{width:20,height:2,background:'var(--accent)',borderRadius:2,display:'inline-block'}} />
              <h2 className="section-title-home" style={{margin:0}}>Featured Players</h2>
            </div>
            <a href="/compare" style={{fontSize:'0.78rem',fontWeight:600,color:'var(--accent)',opacity:0.8}}>
              Compare players →
            </a>
          </div>

          {loading ? (
            <div className="player-grid">
              {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : featured.length === 0 ? (
            <BballLoader />
          ) : (
            <div className="player-grid">
              {featured.map((player, i) => (
  <FeaturedPlayerCard key={player.player_id} player={player} index={i} />
))}
            </div>
          )}
        </section>

        <footer className="footer" style={{position:'relative',zIndex:1}}>StaxNYC Predictor</footer>
      </main>
    </>
  )
}

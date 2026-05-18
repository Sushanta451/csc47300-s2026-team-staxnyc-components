import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { AuthProvider } from './lib/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import PlayerPage from './pages/PlayerPage'
import LiveGamesPage from './pages/LiveGamesPage'
import StandingsPage from './pages/StandingsPage'
import TeamRosterPage from './pages/TeamRosterPage'
import ComparePage from './pages/ComparePage'
import HighlightsPage from './pages/HighlightsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import RequireAdmin from './components/admin/RequireAdmin'

// ─── Hoop ──────────────────────────────────────────────────────────────────
function Hoop({ visible }) {
  return (
    <div style={{
      position: 'fixed',
      top: '6%',
      left: '50%',
      marginLeft: '-85px',
      zIndex: 9998,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0px)' : 'translateY(-80px)',
      transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <svg width="170" height="120" viewBox="0 0 170 120" fill="none">
        <rect x="60" y="2" width="50" height="30" rx="3"
          fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5"/>
        <rect x="70" y="9" width="30" height="18" rx="1.5"
          fill="none" stroke="rgba(255,80,80,0.85)" strokeWidth="2"/>
        <rect x="83" y="32" width="4" height="14" fill="rgba(255,255,255,0.5)" rx="2"/>
        <ellipse cx="85" cy="52" rx="36" ry="8.5"
          fill="none" stroke="#e05a00" strokeWidth="6"/>
        <ellipse cx="85" cy="50" rx="36" ry="8.5"
          fill="none" stroke="rgba(255,140,0,0.35)" strokeWidth="2"/>
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <line key={i}
            x1={50 + i * 8} y1="58"
            x2={54 + i * 6.4} y2="115"
            stroke="rgba(255,255,255,0.38)" strokeWidth="1.4"/>
        ))}
        {[72, 87, 104].map(y => (
          <path key={y}
            d={`M 52 ${y} Q 85 ${y+7} 118 ${y}`}
            fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2"/>
        ))}
      </svg>
    </div>
  )
}

// ─── Ball ──────────────────────────────────────────────────────────────────
function Ball({ shooting }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    if (shooting) {
      ref.current.style.display = 'block'
      ref.current.style.animation = 'none'
      void ref.current.offsetHeight
      ref.current.style.animation = 'bbShot 1.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards'
    } else {
      ref.current.style.display = 'none'
    }
  }, [shooting])

  return (
    <>
      <div ref={ref} style={{
        display: 'none',
        position: 'fixed',
        left: '5vw',
        top: '72vh',
        fontSize: '3.2rem',
        zIndex: 9999,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.7))',
      }}>🏀</div>
      <style>{`
        @keyframes bbShot {
          0%   { transform: translate(0vw,   0vh)   rotate(0deg)   scale(0.75); opacity:1; }
          18%  { transform: translate(9vw,  -18vh)  rotate(80deg)  scale(0.88); opacity:1; }
          38%  { transform: translate(24vw, -42vh)  rotate(190deg) scale(1);    opacity:1; }
          55%  { transform: translate(38vw, -54vh)  rotate(275deg) scale(1);    opacity:1; }
          68%  { transform: translate(43vw, -47vh)  rotate(330deg) scale(0.95); opacity:1; }
          78%  { transform: translate(44vw, -32vh)  rotate(375deg) scale(0.85); opacity:1; }
          88%  { transform: translate(44vw, -14vh)  rotate(410deg) scale(0.65); opacity:0.5; }
          100% { transform: translate(44vw,  4vh)   rotate(440deg) scale(0.35); opacity:0; }
        }
      `}</style>
    </>
  )
}

// ─── Swish ─────────────────────────────────────────────────────────────────
function Swish({ visible }) {
  return (
    <div style={{
      position: 'fixed',
      top: '26%',
      left: 0, right: 0,
      textAlign: 'center',
      zIndex: 10000,
      pointerEvents: 'none',
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
      fontWeight: 900,
      letterSpacing: 10,
      color: '#fff',
      textShadow: '0 0 24px rgba(91,140,255,1), 0 0 70px rgba(91,140,255,0.6), 0 5px 0 rgba(0,0,0,0.55)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1.05)' : 'scale(0.4)',
      transition: 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      SWISH 🔥
    </div>
  )
}

// ─── Glow ──────────────────────────────────────────────────────────────────
function CourtGlow({ visible }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse 75% 55% at 50% 16%, rgba(91,140,255,0.55) 0%, transparent 70%)',
      zIndex: 9996,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}/>
  )
}

// ─── Inner app — has access to useLocation ─────────────────────────────────
function AppInner() {
  const location = useLocation()
  const prevPath  = useRef(location.pathname)
  const busy      = useRef(false)
  const nextPath  = useRef(null)

  const [displayPath, setDisplayPath] = useState(location.pathname)
  const [displayLoc,  setDisplayLoc]  = useState(location)
  const [showHoop,    setShowHoop]    = useState(false)
  const [shooting,    setShooting]    = useState(false)
  const [showSwish,   setShowSwish]   = useState(false)
  const [showGlow,    setShowGlow]    = useState(false)

  useEffect(() => {
    const newPath = location.pathname
    if (newPath === prevPath.current) return
    nextPath.current = location

    if (busy.current) return

    function run(target) {
      busy.current = true
      const fromPath = prevPath.current
      prevPath.current = target.pathname

      const isPlayerNav = target.pathname.startsWith('/player/') ||
                    target.pathname.startsWith('/team/')   ||
                    fromPath.startsWith('/player/') ||
                    fromPath.startsWith('/team/')
      if (!isPlayerNav) {
        setShowHoop(true)
        setTimeout(() => setShooting(true), 150)
        setTimeout(() => { setShowSwish(true); setShowGlow(true) }, 650)
        setTimeout(() => setShowSwish(false), 1050)
      }

      const swapDelay = isPlayerNav ? 300 : 1100
      setTimeout(() => {
        setDisplayLoc(target)
        setDisplayPath(target.pathname)
        setShowHoop(false)
        setShooting(false)
        setShowGlow(false)

        if (nextPath.current && nextPath.current.pathname !== target.pathname) {
          const pending = nextPath.current
          nextPath.current = null
          setTimeout(() => { busy.current = false; run(pending) }, 80)
        } else {
          busy.current = false
        }
      }, swapDelay)
    }

    run(location)
  }, [location.pathname])

  return (
    <>
      <Hoop      visible={showHoop} />
      <Ball      shooting={shooting} />
      <Swish     visible={showSwish} />
      <CourtGlow visible={showGlow} />

      <div
        key={displayPath}
        style={{
          animation: 'pageIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <Routes location={displayLoc}>
          <Route path="/"                      element={<HomePage />} />
          <Route path="/player/:id"            element={<PlayerPage />} />
          <Route path="/live-games"            element={<LiveGamesPage />} />
          <Route path="/standings"             element={<StandingsPage />} />
          <Route path="/team/:teamSlug/roster" element={<TeamRosterPage />} />
          <Route path="/compare"               element={<ComparePage />} />
          <Route path="/highlights"            element={<HighlightsPage />} />
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/signup"                element={<SignupPage />} />
          <Route path="/profile"               element={<ProfilePage />} />
          <Route path="/admin"                 element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Routes>
      </div>

      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      {import.meta.env.DEV && !isSupabaseConfigured && (
        <div className="supabase-env-banner" role="status">
          Supabase env missing: add <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_KEY</code> (or <code>VITE_SUPABASE_ANON_KEY</code>) to{' '}
          <code>.env</code> in the repo root, then restart <code>npm run dev</code>. See{' '}
          <code>.env.example</code>.
        </div>
      )}
      <Navbar />
      <AppInner />
    </AuthProvider>
  )
}

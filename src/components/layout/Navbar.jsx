import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { signOut } from '../../lib/auth'

function NavLink({ to, label, pathname, matchPrefix = false }) {
  const active = matchPrefix ? pathname.startsWith(to) : pathname === to
  return (
    <Link
      to={to}
      className={active ? 'active' : ''}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  )
}

export default function Navbar() {
  const { pathname }              = useLocation()
  const navigate                  = useNavigate()
  const { user, profile, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen]   = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinks = (
    <>
      <NavLink to="/"           label="Home"       pathname={pathname} />
      <NavLink to="/live-games" label="Live"        pathname={pathname} />
      <NavLink to="/standings"  label="Standings"   pathname={pathname} />
      <NavLink to="/compare"    label="Compare"     pathname={pathname} />
      <NavLink to="/highlights" label="Highlights"  pathname={pathname} />
      {user     && <NavLink to="/profile" label="Profile"  pathname={pathname} />}
      {isAdmin  && <NavLink to="/admin"   label="Admin"     pathname={pathname} matchPrefix />}
    </>
  )

  return (
    <>
      <header className="navbar" role="banner">
        <div className="container nav-content">

          <Link to="/" className="brand" aria-label="StaxNYC Predictor — home">
            <div className="brand-badge" aria-hidden="true" />
            <span>StaxNYC</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            {navLinks}
          </nav>

          <div className="nav-user">
            {user ? (
              <>
                <span className="user-chip" title={user.email}>
                  <span className="user-dot" aria-hidden="true" />
                  {profile?.display_name || user.email.split('@')[0]}
                </span>
                <button className="btn-ghost" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost">Log in</Link>
            )}

            <button
              className="btn-ghost"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: 'none',
                padding: '0.4rem 0.55rem',
                fontSize: '1.1rem',
              }}
              ref={(el) => {
                if (el) {
                  el.style.display = window.innerWidth <= 800 ? 'inline-flex' : 'none'
                }
              }}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            style={{
              padding: '0.75rem 1.25rem 1rem',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              background: 'rgba(5, 8, 15, 0.97)',
            }}
          >
            {[
              { to: '/',           label: 'Home'      },
              { to: '/live-games', label: 'Live Games' },
              { to: '/standings',  label: 'Standings'  },
              { to: '/compare',    label: 'Compare'    },
              { to: '/highlights', label: 'Highlights' },
              ...(user    ? [{ to: '/profile', label: 'Profile' }] : []),
              ...(isAdmin ? [{ to: '/admin',   label: 'Admin'   }] : []),
            ].map(({ to, label }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--text)' : 'var(--muted-2)',
                    background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        )}
      </header>
    </>
  )
}

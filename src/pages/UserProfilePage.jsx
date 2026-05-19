import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getPublicProfile } from '../lib/api'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]).join('').toUpperCase()
}

function formatJoined(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long',
    })
  } catch {
    return null
  }
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true); setError(''); setProfile(null)
    getPublicProfile(userId)
      .then((p) => { if (alive) setProfile(p) })
      .catch((e) => { if (alive) setError(e.message || 'Failed to load') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [userId])

  const isMe = user?.id === userId

  return (
    <main className="container user-profile-shell">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span>User</span>
      </nav>

      {loading && (
        <div className="card panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Loading profile…</p>
        </div>
      )}

      {!loading && error && (
        <div className="card panel" style={{ padding: '1.5rem' }}>
          <p className="auth-error">{error}</p>
        </div>
      )}

      {!loading && !error && !profile && (
        <div className="card panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>No such user</h2>
          <p style={{ color: 'var(--muted)' }}>
            We couldn't find a public profile for ID <code>{userId}</code>.
          </p>
        </div>
      )}

      {!loading && !error && profile && (
        <article className="card panel user-profile-card">
          <header className="user-profile-header">
            <div className="user-profile-avatar" aria-hidden="true">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" />
                : <span>{getInitials(profile.display_name)}</span>}
            </div>
            <div className="user-profile-meta">
              <h1 className="user-profile-name">
                {profile.display_name || 'Unnamed user'}
              </h1>
              {formatJoined(profile.created_at) && (
                <p className="user-profile-joined">Joined {formatJoined(profile.created_at)}</p>
              )}
              <p className="user-profile-id" title={profile.id}>
                User ID: <code>{profile.id.slice(0, 8)}…</code>
              </p>
            </div>
            {isMe && (
              <Link to="/profile" className="btn primary">Edit profile</Link>
            )}
          </header>

          {profile.bio && (
            <section className="user-profile-bio">
              <h3 className="user-profile-section-title">Bio</h3>
              <p>{profile.bio}</p>
            </section>
          )}

          {(profile.age || profile.favorite_team || profile.favorite_player) && (
            <section className="user-profile-facts">
              {profile.age && (
                <div className="user-profile-fact fact-amber">
                  <span className="user-profile-fact-label">Age</span>
                  <span className="user-profile-fact-value">{profile.age}</span>
                </div>
              )}
              {profile.favorite_team && (
                <div className="user-profile-fact fact-red">
                  <span className="user-profile-fact-label">Favorite team</span>
                  <span className="user-profile-fact-value">{profile.favorite_team}</span>
                </div>
              )}
              {profile.favorite_player && (
                <div className="user-profile-fact fact-pink">
                  <span className="user-profile-fact-label">Favorite player</span>
                  <span className="user-profile-fact-value">{profile.favorite_player}</span>
                </div>
              )}
            </section>
          )}
        </article>
      )}
    </main>
  )
}

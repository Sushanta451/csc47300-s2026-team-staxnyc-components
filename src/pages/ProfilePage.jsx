import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getMyChangeRequests, createChangeRequest, updateMyProfile } from '../lib/api'
import ProfileFieldCard from '../components/profile/ProfileFieldCard'
import RequestStatusBadge from '../components/profile/RequestStatusBadge'
import { NBA_TEAMS } from '../components/profile/NBA_TEAMS'

const FIELD_LABELS = {
  display_name: 'Display name',
  avatar_url: 'Avatar URL',
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase()
}

export default function ProfilePage() {
  const { user, profile, loading, isAdmin, refreshProfile } = useAuth()
  const [requests, setRequests] = useState([])
  const [reqLoading, setReqLoading] = useState(true)

  async function refresh() {
    if (!user) return
    setReqLoading(true)
    try {
      const r = await getMyChangeRequests(user.id)
      setRequests(r)
    } catch (e) {
      console.error(e)
    } finally {
      setReqLoading(false)
    }
  }

  useEffect(() => { refresh() }, [user?.id])

  async function requestField(field, newValue) {
    await createChangeRequest(user.id, field, newValue || '')
    await refresh()
  }

  async function saveField(updates) {
    await updateMyProfile(user.id, updates)
    await refreshProfile()
  }

  if (loading) return (
    <main className="container"><p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>Loading...</p></main>
  )
  if (!user) return <Navigate to="/login" replace />

  const avatarPreview = (
    <div className="profile-avatar-preview" aria-hidden="true">
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        : <span>{getInitials(profile?.display_name)}</span>}
    </div>
  )

  return (
    <main className="container">
      <section className="page-header">
        <h1>Your Profile</h1>
        <p className="subtitle" style={{ color: 'var(--muted)' }}>
          {isAdmin
            ? 'Admin: every field saves instantly.'
            : 'Display name changes go to an admin for approval. Everything else saves instantly.'}
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
          Public profile link:{' '}
          <Link to={`/user/${user.id}`} className="profile-public-link">
            /user/{user.id.slice(0, 8)}...
          </Link>
        </p>
      </section>

      <section className="profile-field-grid">
        <ProfileFieldCard
          accent="purple"
          title="Profile picture"
          hint={isAdmin ? 'Saves instantly' : 'Saves instantly'}
          value={profile?.avatar_url}
          type="url"
          placeholder="https://example.com/me.jpg"
          preview={avatarPreview}
          onSave={(v) => saveField({ avatar_url: v })}
        />

        <ProfileFieldCard
          accent="blue"
          title="Display name"
          hint={isAdmin ? 'Saves instantly' : 'Goes to an admin for approval'}
          value={profile?.display_name}
          maxLength={40}
          placeholder="How others see you"
          onSave={isAdmin
            ? (v) => saveField({ display_name: v })
            : (v) => requestField('display_name', v)}
        />

        <ProfileFieldCard
          accent="teal"
          title="Bio"
          hint="Saves instantly. Max 280 characters."
          value={profile?.bio}
          rows={3}
          maxLength={280}
          placeholder="A short bio about you"
          onSave={(v) => saveField({ bio: v })}
        />

        <ProfileFieldCard
          accent="amber"
          title="Age"
          hint="Saves instantly"
          value={profile?.age ?? ''}
          type="number"
          placeholder="e.g. 24"
          onSave={(v) => saveField({ age: v })}
        />

        <ProfileFieldCard
          accent="red"
          title="Favorite team"
          hint="Pick one of the 30 NBA teams"
          value={profile?.favorite_team}
          options={NBA_TEAMS}
          placeholder="Select a team..."
          onSave={(v) => saveField({ favorite_team: v })}
        />

        <ProfileFieldCard
          accent="pink"
          title="Favorite player"
          hint="Saves instantly"
          value={profile?.favorite_player}
          maxLength={60}
          placeholder="e.g. Stephen Curry"
          onSave={(v) => saveField({ favorite_player: v })}
        />

        <ProfileFieldCard
          accent="gray"
          title="Role"
          hint="Assigned by an admin"
          value={profile?.Roles || 'user'}
          readOnly
        />

        <ProfileFieldCard
          accent="gray"
          title="Email"
          hint="From your sign-in account"
          value={user.email}
          readOnly
        />
      </section>

      {!isAdmin && (
        <section className="card panel" style={{ marginTop: '1.5rem' }}>
          <h3>Your display-name requests</h3>
          {reqLoading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : requests.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No requests yet.</p>
          ) : (
            <ul className="request-list">
              {requests.map((r) => (
                <li key={r.id} className="request-item">
                  <div className="request-main">
                    <span className="request-field">{FIELD_LABELS[r.field] || r.field}</span>
                    <span className="request-arrow">→</span>
                    <span className="request-value">{r.new_value}</span>
                  </div>
                  <div className="request-meta">
                    <RequestStatusBadge status={r.status} />
                    <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}

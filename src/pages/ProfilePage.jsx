import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getMyChangeRequests, createChangeRequest, updateMyProfile } from '../lib/api'
import ProfileEditForm from '../components/profile/ProfileEditForm'
import ProfileDirectEditForm from '../components/profile/ProfileDirectEditForm'
import BioEditCard from '../components/profile/BioEditCard'
import RequestStatusBadge from '../components/profile/RequestStatusBadge'

const FIELD_LABELS = {
  display_name: 'Display name',
  avatar_url: 'Avatar URL',
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

  async function handleSubmit(field, newValue) {
    await createChangeRequest(user.id, field, newValue)
    await refresh()
  }

  async function handleDirectSave(updates) {
    await updateMyProfile(user.id, updates)
    await refreshProfile()
  }

  async function handleBioSave(newBio) {
    await updateMyProfile(user.id, { bio: newBio })
    await refreshProfile()
  }

  if (loading) return (
    <main className="container"><p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>Loading…</p></main>
  )
  if (!user) return <Navigate to="/login" replace />

  return (
    <main className="container">
      <section className="page-header">
        <h1>Your Profile</h1>
        <p className="subtitle" style={{ color: 'var(--muted)' }}>
          Profile changes are sent to an admin for approval before they go live.
        </p>
      </section>

      <section className="profile-grid">
        <div className="card panel">
          <h3>Current info</h3>
          <dl className="profile-dl">
            <dt>Email</dt><dd>{user.email}</dd>
            <dt>Display name</dt><dd>{profile?.display_name || <em style={{ color: 'var(--muted)' }}>not set</em>}</dd>
            <dt>Avatar URL</dt><dd className="ellipsis">{profile?.avatar_url || <em style={{ color: 'var(--muted)' }}>not set</em>}</dd>
            <dt>Bio</dt><dd>{profile?.bio || <em style={{ color: 'var(--muted)' }}>not set</em>}</dd>
            <dt>Role</dt><dd><span className="pill">{profile?.role || 'user'}</span></dd>
          </dl>
        </div>

        <div className="card panel">
          <h3>{isAdmin ? 'Edit profile' : 'Request name / avatar change'}</h3>
          {isAdmin
            ? <ProfileDirectEditForm profile={profile} onSave={handleDirectSave} />
            : <ProfileEditForm profile={profile} onSubmit={handleSubmit} />
          }
        </div>
      </section>

      {!isAdmin && (
        <section style={{ marginTop: '1.25rem' }}>
          <BioEditCard profile={profile} onSave={handleBioSave} />
        </section>
      )}

      {!isAdmin && (
      <section className="card panel" style={{ marginTop: '1.5rem' }}>
        <h3>Your requests</h3>
        {reqLoading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
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

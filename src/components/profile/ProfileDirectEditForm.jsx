import { useState } from 'react'

export default function ProfileDirectEditForm({ profile, onSave }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [avatarUrl, setAvatarUrl]     = useState(profile?.avatar_url || '')
  const [bio, setBio]                 = useState(profile?.bio || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      await onSave({
        display_name: displayName.trim() || null,
        avatar_url:   avatarUrl.trim() || null,
        bio:          bio.trim() || null,
      })
      setMsg({ kind: 'ok', text: 'Profile updated.' })
    } catch (err) {
      setMsg({ kind: 'err', text: err.message || 'Failed to save' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '0.5rem' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
        As an admin, your changes apply immediately — no approval needed.
      </p>

      <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Display name</label>
      <input className="input" type="text" placeholder="Display name"
             value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

      <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Avatar URL</label>
      <input className="input" type="url" placeholder="https://…/me.jpg"
             value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />

      <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Bio</label>
      <textarea className="input" rows={3} maxLength={280} placeholder="Short bio"
                value={bio} onChange={(e) => setBio(e.target.value)} />

      {msg && <p className={msg.kind === 'ok' ? 'auth-ok' : 'auth-error'}>{msg.text}</p>}

      <button className="btn primary" type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

import { useEffect, useState } from 'react'

export default function BioEditCard({ profile, onSave }) {
  const [bio, setBio] = useState(profile?.bio || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => { setBio(profile?.bio || '') }, [profile?.bio])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      await onSave(bio.trim() || null)
      setMsg({ kind: 'ok', text: 'Bio updated.' })
    } catch (err) {
      setMsg({ kind: 'err', text: err.message || 'Failed to save' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card panel">
      <h3>Bio</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
        Bio updates instantly — no admin approval needed.
      </p>
      <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '0.75rem' }}>
        <textarea className="input" rows={3} maxLength={280} placeholder="A short bio (max 280 chars)"
                  value={bio} onChange={(e) => setBio(e.target.value)} />
        {msg && <p className={msg.kind === 'ok' ? 'auth-ok' : 'auth-error'}>{msg.text}</p>}
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save bio'}
        </button>
      </form>
    </div>
  )
}

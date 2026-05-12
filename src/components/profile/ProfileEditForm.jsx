import { useState } from 'react'

const FIELDS = [
  { key: 'display_name', label: 'Display name', type: 'text',
    placeholder: 'How others see you' },
  { key: 'avatar_url', label: 'Avatar URL', type: 'url',
    placeholder: 'https://…/me.jpg' },
]

export default function ProfileEditForm({ profile, onSubmit }) {
  const [field, setField] = useState('display_name')
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const current = profile?.[field] ?? ''
  const meta = FIELDS.find((f) => f.key === field)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setBusy(true); setMsg(null)
    try {
      await onSubmit(field, value.trim())
      setMsg({ kind: 'ok', text: 'Request submitted — pending admin approval.' })
      setValue('')
    } catch (err) {
      setMsg({ kind: 'err', text: err.message || 'Failed to submit' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '0.5rem' }}>
      <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Field to change</label>
      <select className="input" value={field} onChange={(e) => { setField(e.target.value); setValue('') }}>
        {FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
      </select>

      <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
        Current: <span style={{ color: 'var(--text)' }}>{current || <em style={{ color: 'var(--muted)' }}>not set</em>}</span>
      </label>

      <input className="input" type={meta.type} placeholder={meta.placeholder}
             value={value} onChange={(e) => setValue(e.target.value)} />

      {msg && (
        <p className={msg.kind === 'ok' ? 'auth-ok' : 'auth-error'}>{msg.text}</p>
      )}

      <button className="btn primary" type="submit" disabled={busy || !value.trim()}>
        {busy ? 'Submitting…' : 'Request change'}
      </button>
    </form>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/auth'

export default function SignupPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await signUp(username, displayName)
      if (res.session) navigate('/')
      else setDone(true)
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  if (done) return (
    <main className="container">
      <section className="card auth-card">
        <h2>Almost there</h2>
        <p className="subtitle">
          Account created. <Link to="/login">Log in</Link> with your username.
        </p>
      </section>
    </main>
  )

  return (
    <main className="container">
      <section className="card auth-card">
        <h2>Create account</h2>
        <p className="subtitle">Test mode — just pick a username.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input className="input" type="text" placeholder="Username (no spaces)" required autoFocus
                 pattern="[A-Za-z0-9_.\-]+"
                 value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="input" type="text" placeholder="Display name (optional)"
                 value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          {error && <p className="auth-error">{error}</p>}
          <button className="btn primary" type="submit" disabled={busy || !username.trim()}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

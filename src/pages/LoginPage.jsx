import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await signIn(username)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container">
      <section className="card auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Test mode — username only.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input className="input" type="text" placeholder="Username" required autoFocus
                 value={username} onChange={(e) => setUsername(e.target.value)} />
          {error && <p className="auth-error">{error}</p>}
          <button className="btn primary" type="submit" disabled={busy || !username.trim()}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  )
}

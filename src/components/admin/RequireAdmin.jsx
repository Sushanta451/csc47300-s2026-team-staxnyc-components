import { Navigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

export default function RequireAdmin({ children }) {
  const { user, profile, loading, isAdmin } = useAuth()

  if (loading) return (
    <main className="container">
      <p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>Loading…</p>
    </main>
  )
  if (!user) return <Navigate to="/login" replace />
  if (profile && !isAdmin) return (
    <main className="container">
      <section className="card panel" style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
        <h2>Admins only</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          You need an admin role to view this page.
        </p>
      </section>
    </main>
  )
  if (!profile) return (
    <main className="container">
      <p style={{ color: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>Loading profile…</p>
    </main>
  )
  return children
}

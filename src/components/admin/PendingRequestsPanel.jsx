import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import {
  getPendingRequests, getProfilesByIds,
  approveChangeRequest, rejectChangeRequest,
} from '../../lib/api'
import PendingRequestRow from './PendingRequestRow'

export default function PendingRequestsPanel({ onCountChange }) {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [names, setNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true); setError('')
    try {
      const reqs = await getPendingRequests()
      setRequests(reqs)
      onCountChange?.(reqs.length)
      const ids = [...new Set(reqs.map((r) => r.user_id))]
      const profiles = await getProfilesByIds(ids)
      const map = {}
      profiles.forEach((p) => { map[p.id] = p.display_name })
      setNames(map)
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function handleApprove(req) {
    setBusyId(req.id); setError('')
    try {
      await approveChangeRequest(req, user.id)
      await refresh()
    } catch (err) {
      setError(err.message || 'Approve failed')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(req) {
    setBusyId(req.id); setError('')
    try {
      await rejectChangeRequest(req.id, user.id)
      await refresh()
    } catch (err) {
      setError(err.message || 'Reject failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="card panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Pending Requests</h3>
        <button className="btn-ghost" onClick={refresh} disabled={loading}>Refresh</button>
      </div>

      {error && <p className="auth-error" style={{ marginTop: '0.75rem' }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>Loading…</p>
      ) : requests.length === 0 ? (
        <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>
          No pending requests. You’re all caught up.
        </p>
      ) : (
        <ul className="pending-list">
          {requests.map((r) => (
            <PendingRequestRow
              key={r.id}
              request={r}
              requesterName={names[r.user_id]}
              busy={busyId === r.id}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

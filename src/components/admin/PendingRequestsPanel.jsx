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
    <div className="card panel admin-card">
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-title">Pending Requests</h3>
          <p className="admin-card-sub">
            User-submitted profile changes waiting for your review.
          </p>
        </div>
        <button
          className="icon-btn admin-refresh"
          onClick={refresh}
          disabled={loading}
          title="Refresh"
          aria-label="Refresh requests"
        >
          {loading ? '…' : '↻'}
        </button>
      </div>

      {error && <p className="auth-error" style={{ marginTop: '0.75rem' }}>{error}</p>}

      {loading ? (
        <div className="admin-empty">
          <p>Loading requests…</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty-title">All caught up</p>
          <p className="admin-empty-sub">No pending requests right now. Good work.</p>
        </div>
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

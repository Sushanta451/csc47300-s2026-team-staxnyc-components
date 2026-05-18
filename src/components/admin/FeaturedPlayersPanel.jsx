import { useEffect, useState } from 'react'
import {
  getFeaturedConfig, addFeaturedPlayer, removeFeaturedPlayer,
  updateFeaturedPlayer, searchPlayers,
} from '../../lib/api'
import FeaturedPlayerAdminRow from './FeaturedPlayerAdminRow'
import PlayerPickerModal from '../common/PlayerPickerModal'

export default function FeaturedPlayersPanel() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  async function refresh() {
    setLoading(true); setError('')
    try {
      setRows(await getFeaturedConfig())
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function handleSearch(q) {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    try {
      setResults(await searchPlayers(q, 12))
    } catch (err) {
      console.error(err)
    }
  }

  async function handlePick(playerId) {
    setBusy(true); setError('')
    try {
      const nextOrder = rows.length ? Math.max(...rows.map((r) => r.display_order)) + 1 : 1
      await addFeaturedPlayer(playerId, nextOrder)
      setPickerOpen(false); setQuery(''); setResults([])
      await refresh()
    } catch (err) {
      setError(err.message || 'Add failed')
    } finally {
      setBusy(false)
    }
  }

  async function swapOrder(a, b) {
    setBusy(true); setError('')
    try {
      await updateFeaturedPlayer(a.id, { display_order: b.display_order })
      await updateFeaturedPlayer(b.id, { display_order: a.display_order })
      await refresh()
    } catch (err) {
      setError(err.message || 'Reorder failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleMoveUp(row) {
    const i = rows.findIndex((r) => r.id === row.id)
    if (i <= 0) return
    await swapOrder(row, rows[i - 1])
  }
  async function handleMoveDown(row) {
    const i = rows.findIndex((r) => r.id === row.id)
    if (i === -1 || i >= rows.length - 1) return
    await swapOrder(row, rows[i + 1])
  }

  async function handleToggleActive(row) {
    setBusy(true); setError('')
    try {
      await updateFeaturedPlayer(row.id, { active: !row.active })
      await refresh()
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(row) {
    setBusy(true); setError('')
    try {
      await removeFeaturedPlayer(row.id)
      await refresh()
    } catch (err) {
      setError(err.message || 'Remove failed')
    } finally {
      setBusy(false)
    }
  }

  const usedIds = Object.fromEntries(rows.map((r) => [r.player_id, true]))

  return (
    <div className="card panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Featured Players</h3>
        <button className="btn primary" onClick={() => setPickerOpen(true)} disabled={busy}>
          + Add player
        </button>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
        These appear on the homepage in the order shown. Hidden rows are skipped.
      </p>

      {error && <p className="auth-error" style={{ marginTop: '0.75rem' }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>
          No featured players yet. Click <b>Add player</b> to start.
        </p>
      ) : (
        <ul className="featured-list">
          {rows.map((r, i) => (
            <FeaturedPlayerAdminRow
              key={r.id}
              row={r}
              isFirst={i === 0}
              isLast={i === rows.length - 1}
              busy={busy}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onToggleActive={handleToggleActive}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}

      {pickerOpen && (
        <PlayerPickerModal
          query={query}
          results={results}
          usedIds={usedIds}
          onSearch={handleSearch}
          onSelect={handlePick}
          onClose={() => { setPickerOpen(false); setQuery(''); setResults([]) }}
        />
      )}
    </div>
  )
}

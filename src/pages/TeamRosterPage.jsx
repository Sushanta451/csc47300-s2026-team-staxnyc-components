import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import standingsData from '../data/standings'
import { getPlayersForTeamIdentity, getStandings, getTeamRosterByTeamId } from '../lib/api'
import { getTeamIdentityFromSlug } from '../lib/teamBranding'
import { resolveNbaFranchiseId } from '../lib/nbaTeamIds'
import { currentNbaSeasonSlug } from '../lib/nbaSeason'

function positionBucket(pos) {
  if (!pos) return 'Other'
  const u = String(pos).toUpperCase()
  if (/\bPG\b|^PG/.test(u) || u.startsWith('PG')) return 'PG'
  if (/\bSG\b|^SG/.test(u) || u.startsWith('SG')) return 'SG'
  if (/\bSF\b|^SF/.test(u) || u.startsWith('SF')) return 'SF'
  if (/\bPF\b|^PF/.test(u) || u.startsWith('PF')) return 'PF'
  if (/\bC\b|^C-|^C /.test(u) || u.startsWith('C')) return 'C'
  if (u.includes('GUARD')) return 'Guards'
  if (u.includes('FORWARD')) return 'Forwards'
  if (u.includes('CENTER')) return 'Centers'
  return 'Other'
}

const BUCKET_ORDER = ['PG', 'SG', 'SF', 'PF', 'C', 'Guards', 'Forwards', 'Centers', 'Other']

export default function TeamRosterPage() {
  const { teamSlug } = useParams()
  const [standingsRef, setStandingsRef] = useState(standingsData)

  useEffect(() => {
    let alive = true
    getStandings().then((rows) => {
      if (alive && rows?.length) setStandingsRef(rows)
    })
    return () => { alive = false }
  }, [])

  const identity = useMemo(
    () => getTeamIdentityFromSlug(teamSlug, standingsRef),
    [teamSlug, standingsRef],
  )
  const teamLabel = identity?.canonicalName ?? null

  const standingRow = useMemo(
    () => (teamLabel ? standingsRef.find((r) => r.team === teamLabel) : null),
    [standingsRef, teamLabel],
  )
  const franchiseId = standingRow?.team_id ?? resolveNbaFranchiseId(teamLabel)

  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!identity) {
      setLoading(false)
      setError('Unknown team.')
      setPlayers([])
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const season =
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NBA_SEASON) || currentNbaSeasonSlug()
        let rows = []
        if (franchiseId) {
          rows = await getTeamRosterByTeamId(franchiseId, season)
        }
        if (!rows.length) {
          rows = await getPlayersForTeamIdentity(identity)
        }
        if (!cancelled) setPlayers(rows)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load roster')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [identity, franchiseId])

  const byBucket = useMemo(() => {
    const m = {}
    for (const p of players) {
      const b = positionBucket(p.position)
      if (!m[b]) m[b] = []
      m[b].push(p)
    }
    return m
  }, [players])

  if (!teamSlug) return null

  return (
    <main className="container">
      <section className="page-header">
        <p className="breadcrumb">
          <Link to="/standings" style={{ color: 'var(--muted)' }}>Standings</Link>
          {' / '}
          <span>{teamLabel || 'Team'}</span>
        </p>
      </section>

      <section className="card panel roster-header">
        <h1 className="page-title">{teamLabel || 'Team roster'}</h1>
        {standingRow && (
          <p className="page-subtitle">
            {standingRow.conference} · {standingRow.wins}-{standingRow.losses} ({standingRow.pct.toFixed(3)})
          </p>
        )}
      </section>

      {loading && (
        <p style={{ color: 'var(--muted)', padding: '2rem 0', textAlign: 'center' }}>Loading roster…</p>
      )}
      {!loading && error && (
        <p style={{ color: 'var(--danger)', padding: '2rem 0', textAlign: 'center' }}>{error}</p>
      )}
      {!loading && !error && players.length === 0 && (
        <div className="card panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>
            No roster found for <strong>{teamLabel}</strong>. Run{' '}
            <code>npm run sync:nba -- --players</code> to load <code>nba_team_rosters</code> and{' '}
            <code>player_stats</code>, or use <code>--games</code> for recent games. Static fallback uses{' '}
            <code>player_stats</code> by team name / tricode ({identity?.tricode?.toUpperCase() ?? '—'}).
          </p>
        </div>
      )}

      {!loading && !error && players.length > 0 && (
        <div className="roster-buckets">
          {BUCKET_ORDER.filter((b) => byBucket[b]?.length).map((bucket) => (
            <section key={bucket} className="card panel roster-bucket">
              <h2 className="roster-bucket-title">{bucket}</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Pos</th>
                      <th>PPG</th>
                      <th>RPG</th>
                      <th>APG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byBucket[bucket].map((p) => (
                      <tr key={p.player_id}>
                        <td>{p.jersey_number ?? '—'}</td>
                        <td>
                          <Link to={'/player/' + p.player_id} className="roster-player-link">
                            {p.player_name}
                          </Link>
                        </td>
                        <td>{p.position ?? '—'}</td>
                        <td>{p.ppg ?? '—'}</td>
                        <td>{p.rpg ?? '—'}</td>
                        <td>{p.apg ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      <footer className="footer">StaxNYC Predictor — Team roster</footer>
    </main>
  )
}

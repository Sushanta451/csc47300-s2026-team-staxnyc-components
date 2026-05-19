import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import standingsData from '../data/standings'
import RosterPlayerCard from '../components/roster/RosterPlayerCard'
import TeamRosterHero from '../components/roster/TeamRosterHero'
import { getLiveGames, getPlayersForTeamIdentity, getStandings, getTeamRosterByTeamId } from '../lib/api'
import { buildTeamRosterSummary } from '../lib/teamStats'
import { getTeamIdentityFromSlug, teamNameToSlug } from '../lib/teamBranding'
import { resolveNbaFranchiseId } from '../lib/nbaTeamIds'
import { currentNbaSeasonSlug } from '../lib/nbaSeason'

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

  const standingRow = useMemo(() => {
    if (!standingsRef?.length) return null
    const want = String(teamSlug || '').toLowerCase()
    return standingsRef.find((r) => {
      if (teamLabel && r.team === teamLabel) return true
      if (want && r.team_slug && String(r.team_slug).toLowerCase() === want) return true
      if (want && teamNameToSlug(r.team) === want) return true
      return false
    }) ?? null
  }, [standingsRef, teamLabel, teamSlug])
  const franchiseId = standingRow?.team_id ?? resolveNbaFranchiseId(teamLabel)

  const [players, setPlayers] = useState([])
  const [liveGames, setLiveGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getLiveGames().then((rows) => {
      if (alive) setLiveGames(rows || [])
    })
    return () => { alive = false }
  }, [])

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

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => String(a.player_name).localeCompare(String(b.player_name))),
    [players],
  )

  const teamSummary = useMemo(
    () => buildTeamRosterSummary({
      teamLabel,
      standingRow,
      players: sortedPlayers,
      liveGames,
    }),
    [teamLabel, standingRow, sortedPlayers, liveGames],
  )

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

      <TeamRosterHero
        teamLabel={teamLabel}
        standingRow={standingRow}
        summary={teamSummary}
        franchiseId={franchiseId}
      />

      {loading && (
        <p style={{ color: 'var(--muted)', padding: '2rem 0', textAlign: 'center' }}>Loading roster…</p>
      )}
      {!loading && error && (
        <p style={{ color: 'var(--danger)', padding: '2rem 0', textAlign: 'center' }}>{error}</p>
      )}
      {!loading && !error && players.length === 0 && (
        <div className="card panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>
            No roster found for <strong>{teamLabel}</strong>.
          </p>
        </div>
      )}

      {!loading && !error && players.length > 0 && (
        <section className="card panel roster-grid-panel">
          <div className="roster-grid-header">
            <h2 className="roster-grid-title">Roster</h2>
            <p className="roster-grid-count">{sortedPlayers.length} players</p>
          </div>
          <div className="roster-card-grid">
            {sortedPlayers.map((p, i) => (
              <RosterPlayerCard key={p.player_id} player={p} teamName={teamLabel} index={i} />
            ))}
          </div>
        </section>
      )}

      <footer className="footer">StaxNYC Predictor — Team roster</footer>
    </main>
  )
}

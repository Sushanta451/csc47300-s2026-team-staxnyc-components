import TeamLogo from '../common/TeamLogo'
import PlayerHeroBanner from '../player/PlayerHeroBanner'
import { getTeamBranding } from '../../lib/teamBranding'

function StatBox({ label, value, sub, accent }) {
  if (value == null || value === '') return null
  return (
    <div
      className="stat-box roster-hero-stat"
      style={{
        borderTopColor: accent || 'var(--accent)',
        borderTopWidth: 2,
      }}
    >
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color: accent || 'var(--text)' }}>{value}</p>
      {sub && <p className="roster-hero-stat-sub">{sub}</p>}
    </div>
  )
}

export default function TeamRosterHero({
  teamLabel,
  standingRow,
  summary,
  franchiseId,
}) {
  if (!teamLabel) return null

  const branding = getTeamBranding(teamLabel)
  const accent = branding?.color || '#4f8cff'
  const {
    hasStandings,
    hasLiveGames,
    hasRosterStats,
    record,
    winPct,
    conference,
    rank,
    streak,
    last10,
    liveRecord,
    livePpg,
    liveOppPpg,
    rosterSize,
    teamPpg,
    teamRpg,
    teamApg,
  } = summary || {}

  const subtitle = standingRow
    ? [
        standingRow.conference,
        record,
        standingRow.streak && standingRow.streak !== '—' ? standingRow.streak : null,
      ].filter(Boolean).join(' · ')
    : null

  return (
    <article className="card panel roster-hero">
      <PlayerHeroBanner team={teamLabel} className="roster-hero-banner" />

      <div className="roster-hero-body">
        <div className="roster-hero-main">
          <div
            className="roster-hero-logo-wrap"
            style={{
              borderColor: `${accent}44`,
              boxShadow: `0 0 0 2px ${accent}22, 0 12px 28px rgba(0,0,0,0.4)`,
            }}
          >
            <TeamLogo
              team={teamLabel}
              teamId={franchiseId}
              logoUrl={standingRow?.logo_url}
              size={56}
            />
          </div>

          <div className="roster-hero-info">
            <h1 className="roster-hero-title">{teamLabel}</h1>
            {subtitle && (
              <p className="roster-hero-sub">{subtitle}</p>
            )}
          </div>
        </div>

        {hasStandings && (
          <div className="stats-grid roster-hero-stats">
            <StatBox label="Record" value={record} sub={winPct} accent="var(--accent)" />
            <StatBox
              label="Rank"
              value={rank}
              sub={conference || null}
              accent="var(--accent-2, #818cf8)"
            />
            <StatBox label="Streak" value={streak} accent="var(--warning, #f59e0b)" />
            <StatBox label="Last 10" value={last10} accent="var(--success, #4ade80)" />
          </div>
        )}

        {hasRosterStats && (
          <>
            <p className="roster-hero-section-label">
              Rotation averages
              {rosterSize != null ? ` · ${rosterSize} players` : ''}
            </p>
            <div className="stats-grid roster-hero-stats roster-hero-stats--secondary">
              <StatBox label="PPG" value={teamPpg} accent="var(--accent)" />
              <StatBox label="RPG" value={teamRpg} accent="var(--success, #4ade80)" />
              <StatBox label="APG" value={teamApg} accent="var(--accent-2, #818cf8)" />
            </div>
          </>
        )}

        {hasLiveGames && (
          <>
            <p className="roster-hero-section-label">Tracked finals</p>
            <div className="stats-grid roster-hero-stats roster-hero-stats--secondary">
              <StatBox label="W–L" value={liveRecord} accent="var(--text)" />
              <StatBox label="Scoring" value={livePpg} sub="PPG" accent="var(--accent)" />
              <StatBox label="Allowed" value={liveOppPpg} sub="OPP PPG" accent="var(--muted)" />
            </div>
          </>
        )}
      </div>
    </article>
  )
}

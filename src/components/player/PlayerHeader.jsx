import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamBranding, teamNameToSlug } from '../../lib/teamBranding'

function StatBox({ label, value }) {
  return (
    <div className="stat-box">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  )
}

function nbaHeadshotUrl(playerId) {
  if (!playerId) return null
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`
}

function formatWeight(w) {
  if (w == null || w === '') return '—'
  const n = typeof w === 'number' ? w : parseInt(String(w).replace(/\D/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? `${n} lbs` : `${w} lbs`
}

export default function PlayerHeader({ stats }) {
  const {
    player_id,
    player_name,
    team,
    position,
    height,
    weight,
    jersey_number,
    ppg,
    rpg,
    apg,
    fg_pct,
    season,
    games_played,
    mpg,
    birth_date,
    school,
    country,
    draft_year,
    draft_round,
    draft_number,
  } = stats
  const branding = getTeamBranding(team)
  const [imgOk, setImgOk] = useState(true)
  const headshot = nbaHeadshotUrl(player_id)

  const heroTopStyle = branding
    ? {
        backgroundImage: `linear-gradient(120deg, ${branding.color}e8, rgba(11,16,32,0.94)), url(${branding.logoUrl})`,
        backgroundSize: 'cover, min(42%, 280px)',
        backgroundPosition: 'center, 92% 45%',
        backgroundRepeat: 'no-repeat, no-repeat',
      }
    : undefined

  const draftLine = draft_year
    ? `Draft: ${draft_year}${draft_round ? ` R${draft_round}` : ''}${draft_number ? ` #${draft_number}` : ''}`
    : null

  return (
    <article className="card player-hero">
      <div className={'hero-top' + (branding ? ' hero-top--team' : '')} style={heroTopStyle} />
      <div className="hero-body">
        <div className="player-main">
          <div className="player-avatar player-avatar--nba">
            {headshot && imgOk ? (
              <img
                src={headshot}
                alt=""
                className="player-headshot"
                onError={() => setImgOk(false)}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: '2rem', color: 'var(--muted)' }}>
                {player_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="player-info">
            <div className="player-name-row">
              <h1 className="player-name">{player_name}</h1>
              {team && (
                <Link to={`/team/${teamNameToSlug(team)}/roster`} className="team-pill team-pill--link">
                  {team}
                </Link>
              )}
            </div>
            <div className="player-meta">
              <span>{position}</span>
              <span>{height || '—'}</span>
              <span>{formatWeight(weight)}</span>
              <span>{jersey_number ? `#${jersey_number}` : '—'}</span>
            </div>
            {(country || school || birth_date || draftLine) && (
              <ul className="player-profile-extra">
                {country && <li>{country}</li>}
                {school && <li>{school}</li>}
                {birth_date && <li>Born {birth_date}</li>}
                {draftLine && <li>{draftLine}</li>}
              </ul>
            )}
          </div>
        </div>
        <div className="stats-grid">
          <StatBox label="PPG" value={ppg} />
          <StatBox label="RPG" value={rpg} />
          <StatBox label="APG" value={apg} />
          <StatBox label="FG%" value={fg_pct + '%'} />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Season {season}
          {' · '}
          {games_played} GP
          {' · '}
          {mpg} MPG
        </p>
      </div>
    </article>
  )
}

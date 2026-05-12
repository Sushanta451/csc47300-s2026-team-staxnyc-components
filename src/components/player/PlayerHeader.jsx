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

export default function PlayerHeader({ stats }) {
  const { player_name, team, position, height, weight, jersey_number, ppg, rpg, apg, fg_pct, season, games_played, mpg } = stats
  const branding = getTeamBranding(team)

  const heroTopStyle = branding
    ? {
      backgroundImage: `linear-gradient(120deg, ${branding.color}e8, rgba(11,16,32,0.94)), url(${branding.logoUrl})`,
      backgroundSize: 'cover, min(42%, 280px)',
      backgroundPosition: 'center, 92% 45%',
      backgroundRepeat: 'no-repeat, no-repeat',
    }
    : undefined

  return (
    <article className="card player-hero">
      <div className={'hero-top' + (branding ? ' hero-top--team' : '')} style={heroTopStyle} />
      <div className="hero-body">
        <div className="player-main">
          <div className="player-avatar">
            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: '2rem', color: 'var(--muted)' }}>
              {player_name.charAt(0)}
            </div>
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
              <span>{height}</span>
              <span>{weight} lbs</span>
              <span>#{jersey_number}</span>
            </div>
          </div>
        </div>
        <div className="stats-grid">
          <StatBox label="PPG" value={ppg} />
          <StatBox label="RPG" value={rpg} />
          <StatBox label="APG" value={apg} />
          <StatBox label="FG%" value={fg_pct + '%'} />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Season: {season} | Games: {games_played} | MPG: {mpg}
        </p>
      </div>
    </article>
  )
}

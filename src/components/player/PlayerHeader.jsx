import { useState } from 'react'
import { getPlayerImageUrl, getPlayerInitials } from '../../lib/playerImage'

function StatBox({ label, value }) {
  return (
    <div className="stat-box">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  )
}

export default function PlayerHeader({ stats }) {
  const [imgStatus, setImgStatus] = useState('loading')

  const { player_name, team, position, height, weight,
          jersey_number, ppg, rpg, apg, fg_pct,
          season, games_played, mpg } = stats

  const imageSrc = getPlayerImageUrl(stats)
  const initials = getPlayerInitials(player_name)

  return (
    <article className="card player-hero">
      <div className="hero-top" />
      <div className="hero-body">
        <div className="player-main">
          <div className="player-avatar">
            {imgStatus !== 'loaded' && (
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center',
                            fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)',
                            background: 'linear-gradient(135deg, #1a2540, #0f1629)' }}>
                {initials}
              </div>
            )}
            <img
              src={imageSrc}
              alt={player_name}
              style={{ position: imgStatus === 'loaded' ? 'static' : 'absolute',
                       opacity: imgStatus === 'loaded' ? 1 : 0,
                       width: '100%', height: '100%',
                       objectFit: 'cover', objectPosition: 'center top',
                       transition: 'opacity 0.3s ease' }}
              onLoad={() => setImgStatus('loaded')}
              onError={() => setImgStatus('error')}
            />
          </div>
          <div className="player-info">
            <div className="player-name-row">
              <h1 className="player-name">{player_name}</h1>
              <span className="team-pill">{team}</span>
            </div>
            <div className="player-meta">
              <span>{position}</span>
              {height && <span>{height}</span>}
              {weight && <span>{weight} lbs</span>}
              {jersey_number && <span>#{jersey_number}</span>}
            </div>
          </div>
        </div>
        <div className="stats-grid">
          <StatBox label="PPG" value={ppg} />
          <StatBox label="RPG" value={rpg} />
          <StatBox label="APG" value={apg} />
          <StatBox label="FG%"  value={fg_pct + '%'} />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
          Season: {season} | Games: {games_played} | MPG: {mpg}
        </p>
      </div>
    </article>
  )
}
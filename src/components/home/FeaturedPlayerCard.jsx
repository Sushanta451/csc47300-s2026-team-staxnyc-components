import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayerImageUrl, getPlayerInitials } from '../../lib/playerImage'

export default function FeaturedPlayerCard({ player }) {
  const navigate = useNavigate()
  const [imgStatus, setImgStatus] = useState('loading')

  const imageSrc = getPlayerImageUrl(player)
  const initials = getPlayerInitials(player.player_name || player.name)
  const name     = player.player_name || player.name

  return (
    <article className="player-card">
      <div className="player-image">
        {imgStatus !== 'loaded' && (
          <div className="player-image-fallback">{initials}</div>
        )}
        <img
          src={imageSrc}
          alt={name}
          style={{ opacity: imgStatus === 'loaded' ? 1 : 0, transition: 'opacity 0.3s ease' }}
          onLoad={() => setImgStatus('loaded')}
          onError={() => setImgStatus('error')}
        />
      </div>
      <div className="player-content">
        <h3>{name}</h3>
        {(player.team || player.position) && (
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
            {player.team}{player.team && player.position && ' • '}{player.position}
          </p>
        )}
        <div className="btn-row">
          <button className="btn primary" onClick={() => navigate('/player/' + (player.player_id || player.id))}>
            View Profile
          </button>
        </div>
      </div>
    </article>
  )
}
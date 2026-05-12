import { useState } from 'react'
import { getPlayerImageUrl, getPlayerInitials } from '../../lib/playerImage'

export default function PlayerImage({ player, className = '', style = {} }) {
  const [status, setStatus] = useState('loading')
  const src      = getPlayerImageUrl(player)
  const initials = getPlayerInitials(player?.player_name || player?.name)
  const name     = player?.player_name || player?.name || 'Player'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }} className={className}>
      {status !== 'loaded' && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                      fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)',
                      background: 'linear-gradient(135deg, #1a2540, #0f1629)' }}>
          {initials}
        </div>
      )}
      <img src={src} alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
                 opacity: status === 'loaded' ? 1 : 0, transition: 'opacity 0.3s ease' }}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}
import { useState } from 'react'
import { getPlayerImageUrl, getPlayerInitials } from '../../lib/playerImage'

export default function PlayerImage({ player, className = '', style = {} }) {
  const [status, setStatus] = useState('loading')

  const src      = getPlayerImageUrl(player)
  const initials = getPlayerInitials(player?.player_name || player?.name)
  const name     = player?.player_name || player?.name || 'Player'

  return (
    <div className={`player-img-wrap ${className}`} style={style} aria-label={name}>

      {status !== 'loaded' && (
        <div className="player-img-initials" aria-hidden="true">
          {initials}
        </div>
      )}

      <img
        src={src}
        alt={name}
        className="player-img"
        style={{ opacity: status === 'loaded' ? 1 : 0 }}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}

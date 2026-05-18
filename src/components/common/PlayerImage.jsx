/**
 * PlayerImage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A reusable image component that:
 *   • Loads the player headshot from the NBA CDN (or custom URL)
 *   • Shows an initials avatar while the image is loading
 *   • Falls back to initials if the image fails to load (CDN 404, offline, etc.)
 *
 * Usage:
 *   <PlayerImage player={player} className="player-avatar" />
 */

import { useState } from 'react'
import { getPlayerImageUrl, getPlayerInitials } from '../../lib/playerImage'

export default function PlayerImage({ player, className = '', style = {} }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'loaded' | 'error'

  const src      = getPlayerImageUrl(player)
  const initials = getPlayerInitials(player?.player_name || player?.name)
  const name     = player?.player_name || player?.name || 'Player'

  return (
    <div className={`player-img-wrap ${className}`} style={style} aria-label={name}>

      {/* ── Initials avatar: shown while loading or if image errors ── */}
      {status !== 'loaded' && (
        <div className="player-img-initials" aria-hidden="true">
          {initials}
        </div>
      )}

      {/* ── Actual image ── */}
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

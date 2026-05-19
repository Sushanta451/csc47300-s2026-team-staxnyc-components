import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PlayerImage from '../common/PlayerImage'
import PlayerHeroBanner from '../player/PlayerHeroBanner'
import { formatPlayerMeta, hasMeaningfulPosition } from '../../lib/playerPosition'
import { formatTeamLabel, getTeamBranding } from '../../lib/teamBranding'

function MiniStat({ label, value }) {
  if (value == null || value === '' || value === 0) return null
  return (
    <div className="featured-mini-stat">
      <span className="featured-mini-stat-label">{label}</span>
      <span className="featured-mini-stat-val">{value}</span>
    </div>
  )
}

export default function FeaturedPlayerCard({ player, index = 0 }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const cardRef = useRef(null)

  const name = player.player_name || player.name
  const teamLabel = formatTeamLabel(player.team)
  const branding = getTeamBranding(player.team)
  const accent = branding?.color || '#5b8cff'

  const ppg = player.ppg != null && player.ppg !== '' ? Number(player.ppg) : null
  const rpg = player.rpg != null && player.rpg !== '' ? Number(player.rpg) : null
  const apg = player.apg != null && player.apg !== '' ? Number(player.apg) : null
  const hasStats = [ppg, rpg, apg].some((v) => v != null && v > 0)

  function handleClick() {
    setClicked(true)
    setTimeout(() => navigate('/player/' + (player.player_id || player.id)), 320)
  }

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform = `translateY(-8px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`
  }

  function handleMouseLeave() {
    setHovered(false)
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <article
      ref={cardRef}
      className="player-card player-card--featured"
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        transformStyle: 'preserve-3d',
        transition: clicked
          ? 'transform 0.3s ease, box-shadow 0.3s ease'
          : 'box-shadow 0.3s ease, border-color 0.3s ease',
        animation: `cardDrop 0.6s cubic-bezier(0.22,1,0.36,1) both ${index * 0.12}s`,
        borderColor: hovered ? `${accent}55` : undefined,
        boxShadow: hovered
          ? `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${accent}44`
          : undefined,
      }}
    >
      <div className="featured-card-stage">
        <PlayerHeroBanner
          team={player.team}
          jerseyNumber={player.jersey_number}
          variant="featured"
          className="featured-card-hero"
        />
        <div
          className="featured-card-avatar"
          style={{
            borderColor: `${accent}55`,
            boxShadow: hovered
              ? `0 0 0 3px ${accent}44, 0 16px 40px rgba(0,0,0,0.45)`
              : `0 0 0 2px ${accent}28, 0 12px 28px rgba(0,0,0,0.4)`,
          }}
        >
          <PlayerImage player={player} className="featured-card-avatar-img" />
        </div>
      </div>

      <div className="featured-card-body">
        <div className="featured-card-name-row">
          <h3 className="featured-card-name">{name}</h3>
        </div>

        {(teamLabel || hasMeaningfulPosition(player.position)) && (
          <p className="featured-card-sub">
            {formatPlayerMeta(teamLabel, player.position)}
          </p>
        )}

        {hasStats && (
          <div className="featured-mini-stats">
            <MiniStat label="PPG" value={ppg > 0 ? ppg : null} />
            <MiniStat label="RPG" value={rpg > 0 ? rpg : null} />
            <MiniStat label="APG" value={apg > 0 ? apg : null} />
          </div>
        )}

        <div className="btn-row featured-card-actions">
          <button
            type="button"
            className="btn primary"
            onClick={(e) => { e.stopPropagation(); handleClick() }}
          >
            View Profile →
          </button>
        </div>
      </div>

      {clicked && <div className="featured-card-flash" aria-hidden="true" />}
    </article>
  )
}

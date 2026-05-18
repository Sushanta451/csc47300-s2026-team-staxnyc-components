/**
 * FeaturedPlayerCard.jsx — Basketball-themed interactive card
 * Hover: image zoom, spotlight glow, stat reveal, rim flash
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlayerImageUrl, getPlayerInitials } from '../../lib/playerImage'

export default function FeaturedPlayerCard({ player, index = 0 }) {
  const navigate   = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [imgStatus, setImgStatus] = useState('loading')
  const [clicked, setClicked]  = useState(false)
  const cardRef = useRef(null)

  const imageSrc = getPlayerImageUrl(player)
  const initials = getPlayerInitials(player.player_name || player.name)
  const name     = player.player_name || player.name

  function handleClick() {
    setClicked(true)
    setTimeout(() => navigate('/player/' + (player.player_id || player.id)), 320)
  }

  // 3D tilt on mouse move
  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    cardRef.current.style.transform = `translateY(-10px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
  }

  function handleMouseLeave() {
    setHovered(false)
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <>
      <article
        ref={cardRef}
        className="player-card"
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          transition: clicked
            ? 'transform 0.3s ease, box-shadow 0.3s ease'
            : 'box-shadow 0.3s ease',
          boxShadow: hovered
            ? '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,140,255,0.3), 0 0 50px rgba(91,140,255,0.15)'
            : '0 12px 30px rgba(0,0,0,0.35)',
          animation: `cardDrop 0.6s cubic-bezier(0.22,1,0.36,1) both ${index * 0.12}s`,
          border: hovered ? '1px solid rgba(91,140,255,0.4)' : '1px solid var(--panel-border)',
        }}
      >
        {/* Top accent bar that sweeps in */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 4,
          background: 'linear-gradient(90deg, var(--accent), var(--accent-2), var(--success))',
          transform: `scaleX(${hovered ? 1 : 0})`,
          transformOrigin: 'left',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        }} />

        {/* Basketball court floor overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          opacity: hovered ? 0.07 : 0,
          transition: 'opacity 0.3s ease',
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 40px)
          `,
        }} />

        {/* Spotlight glow behind player */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '200%', height: '60%', zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(91,140,255,0.25) 0%, transparent 70%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }} />

        {/* Image */}
        <div className="player-image" style={{ position: 'relative', overflow: 'hidden' }}>
          {imgStatus !== 'loaded' && (
            <div className="player-image-fallback" style={{ zIndex: 2 }}>{initials}</div>
          )}
          <img
            src={imageSrc}
            alt={name}
            style={{
              opacity: imgStatus === 'loaded' ? 1 : 0,
              transition: 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
              zIndex: 2, position: 'relative',
            }}
            onLoad={() => setImgStatus('loaded')}
            onError={() => setImgStatus('error')}
          />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
            background: 'linear-gradient(to top, rgba(11,16,32,0.95), transparent)',
            zIndex: 3, pointerEvents: 'none',
            opacity: hovered ? 1 : 0.6,
            transition: 'opacity 0.3s ease',
          }} />

          {/* Player name overlaid on image on hover */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '1rem', zIndex: 4,
            transform: `translateY(${hovered ? '0' : '8px'})`,
            opacity: hovered ? 1 : 0,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
          }}>
            <div style={{
              fontSize: '1.1rem', fontWeight: 800,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}>{name}</div>
            {player.team && (
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                {player.team} · {player.position}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="player-content" style={{ position: 'relative', zIndex: 2 }}>
          <h3 style={{ transition: 'opacity 0.2s ease', opacity: hovered ? 0.5 : 1 }}>{name}</h3>

          {(player.team || player.position) && (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: hovered ? '0 0 10px rgba(91,140,255,0.9)' : 'none',
                transition: 'box-shadow 0.3s ease',
                animation: hovered ? 'dotPulse 1s ease-in-out infinite' : 'none',
              }} />
              {player.team}{player.position && ` · ${player.position}`}
            </p>
          )}

          <div className="btn-row">
            <button
              className="btn primary"
              onClick={e => { e.stopPropagation(); handleClick() }}
              style={{
                transform: hovered ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
                boxShadow: hovered ? '0 10px 24px rgba(91,140,255,0.45)' : 'none',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
              }}
            >
              View Profile →
            </button>
          </div>
        </div>

        {/* Click ripple */}
        {clicked && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
            background: 'rgba(91,140,255,0.15)',
            animation: 'clickFlash 0.3s ease forwards',
          }} />
        )}
      </article>

      <style>{`
        @keyframes cardDrop {
          from { opacity: 0; transform: translateY(32px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0.6; }
        }
        @keyframes clickFlash {
          from { opacity: 1; }
          to   { opacity: 0; transform: scale(1.05); }
        }
      `}</style>
    </>
  )
}

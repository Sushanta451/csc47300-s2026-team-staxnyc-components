import { getTeamBranding } from '../../lib/teamBranding'

function BannerParticles() {
  const ps = [
    { x: 12, y: 25, s: 16, d: 0, t: 3.2 },
    { x: 78, y: 55, s: 11, d: 0.8, t: 2.8 },
    { x: 48, y: 18, s: 8, d: 1.4, t: 3.6 },
    { x: 88, y: 38, s: 20, d: 0.3, t: 2.5 },
    { x: 32, y: 72, s: 9, d: 1.1, t: 3.0 },
  ]
  return (
    <>
      {ps.map((p, i) => (
        <div
          key={i}
          className="player-hero-banner-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.s,
            animation: `particleFloat ${p.t}s ease-in-out ${p.d}s infinite`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

/**
 * Team-colored hero strip (player profile `.hero-top`).
 * variant: default | compact | featured (tall + logo watermark for home cards)
 */
export default function PlayerHeroBanner({
  team,
  jerseyNumber = null,
  variant = 'default',
  className = '',
}) {
  const branding = getTeamBranding(team)
  const teamColor = branding?.color || '#4f8cff'
  const logoUrl = branding?.logoUrl || null
  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'

  const variantClass = isFeatured
    ? ' player-hero-banner--featured'
    : isCompact
      ? ' player-hero-banner--compact'
      : ''

  return (
    <div
      className={`player-hero-banner${variantClass}${className ? ` ${className}` : ''}`}
      style={{ background: `linear-gradient(120deg, ${teamColor}ee, ${teamColor}55)` }}
      aria-hidden="true"
    >
      <div className="player-hero-banner-stripes" />
      <BannerParticles />
      <svg
        className="player-hero-banner-curve"
        width="240"
        height="140"
        viewBox="0 0 240 140"
        aria-hidden="true"
      >
        <path d="M 240 140 Q 120 -20 0 140" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="120" cy="45" r="32" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
      {logoUrl && isFeatured && (
        <img
          src={logoUrl}
          alt=""
          className="player-hero-banner-logo-backdrop"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )}
      {logoUrl && !isFeatured && (
        <img
          src={logoUrl}
          alt=""
          className="player-hero-banner-logo"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )}
      {jerseyNumber != null && jerseyNumber !== '' && (
        <div className="player-hero-banner-jersey">#{jerseyNumber}</div>
      )}
      <div
        className="player-hero-banner-glow"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${teamColor}44, transparent 60%)` }}
      />
    </div>
  )
}

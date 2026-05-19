import { useState } from 'react'
import { getTeamLogoUrl } from '../../lib/teamBranding'

/**
 * Logos from ESPN CDN (see teamBranding.logoUrlForTricode), not from nba_api assets.
 */
export default function TeamLogo({ team, teamId, logoUrl, size = 28, className = '' }) {
  const [failed, setFailed] = useState(false)
  const src = getTeamLogoUrl(team, teamId, logoUrl)
  const boxClass = `team-logo-box ${className}`.trim()

  if (!src || failed) {
    return (
      <span
        className={`${boxClass} team-logo-box--placeholder`}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
        aria-hidden
      >
        {(team || '?').slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    <span className={boxClass} style={{ width: size, height: size }}>
      <img
        src={src}
        alt=""
        className="team-logo"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  )
}

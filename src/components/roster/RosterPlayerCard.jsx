import { Link } from 'react-router-dom'
import PlayerImage from '../common/PlayerImage'
import { teamCardSurfaceStyle } from '../../lib/teamBranding'

export default function RosterPlayerCard({ player, teamName, index = 0 }) {
  const surface = teamCardSurfaceStyle(teamName || player.team)

  return (
    <Link
      to={`/player/${player.player_id}`}
      className="roster-player-card card-pop-in"
      style={{
        ...surface,
        '--card-pop-delay': `${Math.min(index * 0.06, 1.2)}s`,
      }}
    >
      <PlayerImage player={player} className="roster-player-card-img" />
      <span className="roster-player-card-name">{player.player_name}</span>
    </Link>
  )
}

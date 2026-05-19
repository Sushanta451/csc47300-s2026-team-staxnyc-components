import { Link } from 'react-router-dom'
import TeamLogo from '../common/TeamLogo'
import { teamRosterPath } from '../../lib/teamBranding'

export default function TeamScoreRow({ teamName, score, teamId }) {
  const rosterPath = teamRosterPath(teamName)

  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
        <TeamLogo team={teamName} teamId={teamId} size={40} />
        {rosterPath ? (
          <Link to={rosterPath} className="live-team-name-link">
            {teamName}
          </Link>
        ) : (
          <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, lineHeight: 1.2 }}>{teamName}</p>
        )}
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
        {score !== null && score !== undefined ? score : '-'}
      </p>
    </div>
  )
}

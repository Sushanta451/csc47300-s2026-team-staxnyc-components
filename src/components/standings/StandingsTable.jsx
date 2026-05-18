import { Link } from 'react-router-dom'
import { teamNameToSlug } from '../../lib/teamBranding'

export default function StandingsTable({ rows, hideConferenceLink }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>PCT</th>
            <th>GB</th>
            <th>Streak</th>
            <th>Last 10</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            // Build the slug: prefer team_slug from DB, fall back to generating from name
            const slug = (r.team_slug && String(r.team_slug).trim()) || teamNameToSlug(r.team)
            return (
              <tr key={r.conference + '-' + r.rank + '-' + r.team}>
                <td>{r.rank}</td>
                <td>
                  <Link to={`/team/${slug}/roster`} className="standings-team-link">
                    {r.team}
                  </Link>
                  {!hideConferenceLink && (
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}> • {r.conference}</span>
                  )}
                </td>
                <td>{r.wins}</td>
                <td>{r.losses}</td>
                <td>{r.pct.toFixed(3)}</td>
                <td>{r.gb === 0 ? '—' : r.gb}</td>
                <td>{r.streak}</td>
                <td>{r.last10}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

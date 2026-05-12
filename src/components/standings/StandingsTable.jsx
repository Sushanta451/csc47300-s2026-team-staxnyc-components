export default function StandingsTable({ rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th><th>Team</th><th>W</th><th>L</th>
            <th>PCT</th><th>GB</th><th>Streak</th><th>Last 10</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.conference + '-' + r.rank}>
              <td>{r.rank}</td>
              <td>{r.team} <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>• {r.conference}</span></td>
              <td>{r.wins}</td>
              <td>{r.losses}</td>
              <td>{r.pct.toFixed(3)}</td>
              <td>{r.gb === 0 ? '—' : r.gb}</td>
              <td>{r.streak}</td>
              <td>{r.last10}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

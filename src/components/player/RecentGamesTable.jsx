export default function RecentGamesTable({ games }) {
  const showMatchup = games.some((g) => g.matchup)
  return (
    <article className="card section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Recent Games</h2>
          <p className="section-note">Last {games.length} games (NBA.com via sync)</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              {showMatchup && <th>Matchup</th>}
              <th>Opp</th>
              <th>PTS</th>
              <th>REB</th>
              <th>AST</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g, i) => (
              <tr key={g.game_id || i}>
                <td>{g.game_date}</td>
                {showMatchup && <td className="cell-muted">{g.matchup || '—'}</td>}
                <td>{g.opponent ?? '—'}</td>
                <td>{g.pts}</td>
                <td>{g.reb}</td>
                <td>{g.ast}</td>
                <td className={g.result === 'W' ? 'result-win' : 'result-loss'}>
                  {g.result ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default function PointsTrendChart({ games, avgPpg }) {
  const maxPts = Math.max(...games.map(g => g.pts || 0), 1)

  return (
    <article className="card section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Recent Points Trend</h2>
          <p className="section-note">Last {games.length} games</p>
        </div>
        <span className="pill">Avg {avgPpg}</span>
      </div>
      <div className="chart" style={{ gridTemplateColumns: 'repeat(' + games.length + ', 1fr)' }}>
        {games.slice().reverse().map((g, i) => {
          const pts = g.pts || 0
          const pct = Math.round((pts / maxPts) * 100)
          return (
            <div key={i} className="bar-wrap">
              <div className="bar" style={{ height: pct + '%' }} />
              <div className="bar-value">{pts}</div>
              <div className="bar-label">G{i + 1}</div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

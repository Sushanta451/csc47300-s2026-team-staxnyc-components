import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PointsTrendChart({ games, avgPpg }) {
  const [hovered, setHovered] = useState(null)

  const ordered = [...games].reverse()
  const pts     = ordered.map(g => Number(g.pts) || 0)
  const maxPts  = Math.max(...pts, 1)
  const avg     = parseFloat(avgPpg) || (pts.reduce((a, b) => a + b, 0) / (pts.length || 1))
  const avgPct  = Math.round((avg / maxPts) * 100)

  return (
    <article className="card section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Recent Points Trend</h2>
          <p className="section-note">Last {games.length} games · oldest → newest</p>
        </div>
        <span className="pill" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(79,140,255,0.12)', color: 'var(--accent)', border: '1px solid rgba(79,140,255,0.25)' }}>
          Avg {Math.round(avg * 10) / 10}
        </span>
      </div>

      <div style={{ position: 'relative', padding: '0.5rem 0.25rem 0' }}>

        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: `calc(2rem + ${avgPct}%)`,
          height: 1,
          background: 'rgba(79,140,255,0.4)',
          borderTop: '1px dashed rgba(79,140,255,0.5)',
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          <span style={{
            position: 'absolute', right: 0, top: -10,
            fontSize: '0.62rem', color: 'rgba(79,140,255,0.7)',
            fontFamily: 'var(--font-mono)',
            background: 'var(--bg-2, #080d1c)',
            padding: '0 4px',
          }}>
            AVG
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${ordered.length}, 1fr)`,
          alignItems: 'end',
          height: 180,
          gap: '0.35rem',
          padding: '0 0.15rem',
        }}>
          {ordered.map((g, i) => {
            const p       = Number(g.pts) || 0
            const heightP = Math.round((p / maxPts) * 100)
            const isWin   = g.result === 'W'
            const isHov   = hovered === i
            const barColor = isWin
              ? 'linear-gradient(180deg, #34d399, #059669)'
              : 'linear-gradient(180deg, #f87171, #dc2626)'

            return (
              <div
                key={i}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {isHov && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8, zIndex: 10,
                    background: '#0d1428',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, padding: '0.45rem 0.65rem',
                    whiteSpace: 'nowrap', fontSize: '0.72rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                  }}>
                    <div style={{ fontWeight: 700, color: isWin ? '#34d399' : '#f87171', marginBottom: 2 }}>
                      {isWin ? 'W' : 'L'} vs {g.opponent || '?'}
                    </div>
                    <div style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p} PTS</div>
                    {g.reb != null && <div style={{ color: 'var(--muted-2)' }}>{g.reb} REB · {g.ast} AST</div>}
                    {g.game_date && <div style={{ color: 'var(--muted)', marginTop: 2 }}>{formatDate(g.game_date)}</div>}
                  </div>
                )}

                <div style={{
                  width: '100%',
                  height: `${heightP}%`,
                  minHeight: 8,
                  borderRadius: '6px 6px 3px 3px',
                  background: barColor,
                  opacity: isHov ? 1 : 0.85,
                  transform: isHov ? 'scaleX(1.08)' : 'scaleX(1)',
                  transition: 'transform 0.15s ease, opacity 0.15s ease, filter 0.15s ease',
                  filter: isHov ? 'brightness(1.2)' : 'none',
                  boxShadow: isHov ? (isWin ? '0 0 16px rgba(52,211,153,0.4)' : '0 0 16px rgba(248,113,113,0.4)') : 'none',
                }} />

                <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: isHov ? 'var(--text)' : 'var(--muted-2)', fontWeight: 600, lineHeight: 1 }}>
                  {p}
                </div>

                <div style={{ fontSize: '0.58rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1, maxWidth: 32, overflow: 'hidden' }}>
                  {g.game_date ? formatDate(g.game_date) : `G${i + 1}`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {[['#34d399', 'Win'], ['#f87171', 'Loss'], ['rgba(79,140,255,0.5)', 'Season avg']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block', flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    </article>
  )
}

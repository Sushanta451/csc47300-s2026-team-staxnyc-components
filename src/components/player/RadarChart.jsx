const STAT_KEYS = ['ppg', 'rpg', 'apg', 'fg_pct']

function statLabel(key) {
  if (key === 'ppg') return 'PPG'
  if (key === 'rpg') return 'RPG'
  if (key === 'apg') return 'APG'
  return 'FG%'
}

function statTooltip(key) {
  if (key === 'ppg') return 'Points per game'
  if (key === 'rpg') return 'Rebounds per game'
  if (key === 'apg') return 'Assists per game'
  return 'Field goal percentage'
}

function radarPoint(cx, cy, radius, angle, norm) {
  return {
    x: cx + radius * norm * Math.cos(angle),
    y: cy + radius * norm * Math.sin(angle),
  }
}

export { STAT_KEYS, statLabel, statTooltip }

export default function RadarChart({ series }) {
  const size = 300
  const pad = 44
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - pad
  const n = STAT_KEYS.length
  const rings = [0.33, 0.66, 1]

  const gridPolys = rings.map((rr, idx) => {
    const pts = []
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
      const pt = radarPoint(cx, cy, R, angle, rr)
      pts.push(pt.x.toFixed(2) + ',' + pt.y.toFixed(2))
    }
    return <polygon key={'grid-' + idx} points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
  })

  const axisLines = []
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    const outer = radarPoint(cx, cy, R, angle, 1)
    axisLines.push(<line key={'axis-' + i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />)
  }

  const labelEls = []
  const labelR = R + 16
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    const pt = radarPoint(cx, cy, labelR, angle, 1)
    labelEls.push(
      <text key={'lbl-' + i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" fill="var(--muted)" fontSize={11} fontWeight={700} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <title>{statTooltip(STAT_KEYS[i])}</title>
        {statLabel(STAT_KEYS[i])}
      </text>
    )
  }

  const drawn = series.filter(s => s.visible && s.normValues && s.normValues.length === n)
  drawn.sort((a, b) => {
    const sumA = a.normValues.reduce((s, v) => s + (v || 0), 0)
    const sumB = b.normValues.reduce((s, v) => s + (v || 0), 0)
    return sumA - sumB
  })

  const playerPolys = drawn.map(ser => {
    const pts = []
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
      const nv = Math.max(0, Math.min(1, ser.normValues[i] || 0))
      const pt = radarPoint(cx, cy, R, angle, nv)
      pts.push(pt.x.toFixed(2) + ',' + pt.y.toFixed(2))
    }
    return (
      <polygon key={'player-' + ser.playerId} points={pts.join(' ')} fill={ser.color} fillOpacity={0.22} stroke={ser.color} strokeWidth={2.5} strokeLinejoin="round">
        <title>{ser.name}</title>
      </polygon>
    )
  })

  return (
    <div className="radar-wrap radar-wrap--hero">
      <svg className="radar-svg radar-svg--hero" width={size} height={size} viewBox={'0 0 ' + size + ' ' + size} role="img" aria-label="Radar chart comparing players">
        {gridPolys}
        {axisLines}
        {playerPolys}
        {labelEls}
      </svg>
    </div>
  )
}

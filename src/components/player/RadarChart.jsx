import { useCallback, useMemo, useState } from 'react'
import {
  STAT_KEYS,
  statLabel,
  statTooltip,
  buildRadarAxisTooltip,
} from '../../lib/compareStats'

function radarPoint(cx, cy, radius, angle, norm) {
  return {
    x: cx + radius * norm * Math.cos(angle),
    y: cy + radius * norm * Math.sin(angle),
  }
}

export { STAT_KEYS, statLabel, statTooltip }

export default function RadarChart({ series }) {
  const [tip, setTip] = useState(null)

  const size = 340
  const pad = 40
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - pad
  const n = STAT_KEYS.length
  const rings = [0.33, 0.66, 1]

  const drawn = useMemo(() => {
    const list = (series || []).filter(
      (s) => s.visible && s.normValues && s.normValues.length === n,
    )
    list.sort((a, b) => {
      const sumA = a.normValues.reduce((s, v) => s + (v || 0), 0)
      const sumB = b.normValues.reduce((s, v) => s + (v || 0), 0)
      return sumA - sumB
    })
    return list
  }, [series, n])

  const hasShape = drawn.some((s) => s.normValues.some((v) => v > 0.02))

  const showTip = useCallback((axisIndex, e) => {
    setTip({
      axisIndex,
      x: e.clientX,
      y: e.clientY,
    })
  }, [])

  const moveTip = useCallback((e) => {
    setTip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
  }, [])

  const hideTip = useCallback(() => setTip(null), [])

  const tipContent = tip != null ? buildRadarAxisTooltip(series, tip.axisIndex) : null

  const gridPolys = rings.map((rr, idx) => {
    const pts = []
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
      const pt = radarPoint(cx, cy, R, angle, rr)
      pts.push(`${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
    }
    return (
      <polygon
        key={`grid-${idx}`}
        points={pts.join(' ')}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />
    )
  })

  const axisLines = []
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    const outer = radarPoint(cx, cy, R, angle, 1)
    axisLines.push(
      <line
        key={`axis-${i}`}
        x1={cx}
        y1={cy}
        x2={outer.x}
        y2={outer.y}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />,
    )
  }

  const labelEls = []
  const labelR = R + 16
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    const pt = radarPoint(cx, cy, labelR, angle, 1)
    labelEls.push(
      <text
        key={`lbl-${i}`}
        x={pt.x}
        y={pt.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--muted)"
        fontSize={10}
        fontWeight={700}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <title>{statTooltip(STAT_KEYS[i])}</title>
        {statLabel(STAT_KEYS[i])}
      </text>,
    )
  }

  const playerPolys = drawn.map((ser) => {
    const pts = []
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
      const nv = Math.max(0, Math.min(1, ser.normValues[i] || 0))
      const pt = radarPoint(cx, cy, R, angle, nv)
      pts.push(`${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
    }
    return (
      <polygon
        key={`player-${ser.playerId}`}
        points={pts.join(' ')}
        fill={ser.color}
        fillOpacity={0.38}
        stroke={ser.color}
        strokeWidth={3}
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />
    )
  })

  const vertexDots = []
  for (const ser of drawn) {
    for (let i = 0; i < n; i++) {
      const nv = Math.max(0, Math.min(1, ser.normValues[i] || 0))
      if (nv <= 0.02) continue
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
      const pt = radarPoint(cx, cy, R, angle, nv)
      vertexDots.push(
        <circle
          key={`dot-${ser.playerId}-${i}`}
          cx={pt.x}
          cy={pt.y}
          r={5}
          fill={ser.color}
          stroke="rgba(255,255,255,0.92)"
          strokeWidth={2}
          className="radar-vertex-dot"
          onMouseEnter={(e) => showTip(i, e)}
          onMouseMove={moveTip}
          onMouseLeave={hideTip}
        />,
      )
    }
  }

  return (
    <div className="radar-wrap radar-wrap--hero">
      <svg
        className="radar-svg radar-svg--hero"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Radar chart comparing players"
        onMouseLeave={hideTip}
      >
        {gridPolys}
        {axisLines}
        {hasShape ? playerPolys : null}
        {hasShape ? vertexDots : null}
        {labelEls}
      </svg>

      {tip && tipContent && (
        <div
          className="radar-vertex-tip"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
          role="tooltip"
        >
          <div className="radar-vertex-tip-title">{tipContent.statLabel}</div>
          <ul className="radar-vertex-tip-list">
            {tipContent.entries.map((entry) => (
              <li
                key={entry.name}
                className={
                  'radar-vertex-tip-row' + (entry.leader ? ' radar-vertex-tip-row--high' : ' radar-vertex-tip-row--low')
                }
              >
                <span
                  className="radar-vertex-tip-swatch"
                  style={{ background: entry.color }}
                  aria-hidden="true"
                />
                <span className="radar-vertex-tip-name">{entry.name}</span>
                <span className="radar-vertex-tip-val">{entry.formatted}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasShape && drawn.length > 0 && (
        <p className="radar-empty-hint radar-empty-hint--overlay">
          No stat data available for the selected players.
        </p>
      )}
    </div>
  )
}

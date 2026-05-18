import { STAT_KEYS, statLabel } from '../player/RadarChart'

function formatStat(key, value) {
  if (key === 'fg_pct') return value + '%'
  return value
}

function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return '#5b8cff'
  const h = hex.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(h)) return h
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
    return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  }
  return '#5b8cff'
}

export { normalizeHex }

export default function ComparePlayerCard({ slotId, player, isJustAdded, onChart, cardColor, onToggleChart, onColorChange, onColorReset, onRemove }) {
  const enterClass = isJustAdded ? ' card-enter' : ''
  const color = normalizeHex(cardColor)

  return (
    <section className={'card panel compare-card' + enterClass} key={'slot-' + slotId}>
      <label className="compare-chart-toggle">
        <input type="checkbox" checked={onChart} onChange={onToggleChart} />
        <span>On chart</span>
      </label>
      <div className="compare-color-row">
        <label className="compare-color-label">Color</label>
        <input className="compare-color-input" type="color" value={color} onChange={e => onColorChange(e.target.value)} />
        <button type="button" className="compare-color-reset" onClick={onColorReset}>Reset</button>
      </div>
      <div className="compare-card-color" style={{ background: color, boxShadow: '0 0 12px ' + color + '99' }} />
      <div className="compare-card-body">
        <div className="player-name compare-name-sm">{player.player_name}</div>
        <div className="player-sub compare-sub-sm">{player.team} &middot; {player.position}</div>
        <div className="compare-stat-line">
          {STAT_KEYS.map((sk, i) => (
            <span key={sk}>
              <span className="compare-stat-k">{statLabel(sk)}</span>{' '}
              <span className="compare-stat-v">{formatStat(sk, player[sk])}</span>
              {i < STAT_KEYS.length - 1 && <span className="compare-stat-sep">|</span>}
            </span>
          ))}
        </div>
      </div>
      <button type="button" className="compare-remove-btn" onClick={onRemove} title="Remove player">&times;</button>
    </section>
  )
}

export default function FeaturedPlayerAdminRow({
  row, isFirst, isLast, busy,
  onMoveUp, onMoveDown, onToggleActive, onRemove,
}) {
  const player = row.player
  return (
    <li className="featured-row">
      <div className="featured-info">
        <span className="featured-order">#{row.display_order}</span>
        <div className="featured-name-block">
          <span className="featured-name">
            {player ? player.player_name : <em style={{ color: 'var(--muted)' }}>Unknown player ({row.player_id})</em>}
          </span>
          {player && (
            <span className="featured-meta">{player.team} · {player.position}</span>
          )}
        </div>
        {!row.active && <span className="pill" style={{ background: 'rgba(255,255,255,0.06)' }}>Hidden</span>}
      </div>

      <div className="featured-actions">
        <button className="icon-btn" title="Move up" disabled={busy || isFirst} onClick={() => onMoveUp(row)}>↑</button>
        <button className="icon-btn" title="Move down" disabled={busy || isLast} onClick={() => onMoveDown(row)}>↓</button>
        <button className="btn-ghost" disabled={busy} onClick={() => onToggleActive(row)}>
          {row.active ? 'Hide' : 'Show'}
        </button>
        <button className="btn-ghost danger" disabled={busy} onClick={() => onRemove(row)}>Remove</button>
      </div>
    </li>
  )
}

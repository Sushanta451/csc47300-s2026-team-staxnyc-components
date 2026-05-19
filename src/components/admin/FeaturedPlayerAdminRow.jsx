import PlayerImage from '../common/PlayerImage'

export default function FeaturedPlayerAdminRow({
  row, isFirst, isLast, busy,
  onMoveUp, onMoveDown, onToggleActive, onRemove,
}) {
  const player = row.player
  const hidden = !row.active

  return (
    <li className={'featured-row' + (hidden ? ' is-hidden' : '')}>
      <span className="featured-order" aria-label={`Slot ${row.display_order}`}>
        #{row.display_order}
      </span>

      <div className="featured-portrait">
        {player ? (
          <PlayerImage player={player} className="featured-portrait-img" />
        ) : (
          <div className="featured-portrait-img placeholder" aria-hidden="true">?</div>
        )}
        {hidden && <span className="featured-hidden-badge">Hidden</span>}
      </div>

      <div className="featured-info">
        <div className="featured-name-block">
          <span className="featured-name">
            {player
              ? player.player_name
              : <em style={{ color: 'var(--muted)' }}>Unknown player ({row.player_id})</em>}
          </span>
          {player && (
            <span className="featured-meta">
              {player.team}
              {player.position ? ` · ${player.position}` : ''}
              {player.jersey_number ? ` · #${player.jersey_number}` : ''}
            </span>
          )}
        </div>
      </div>

      <div className="featured-actions">
        <div className="featured-reorder">
          <button
            className="icon-btn"
            title="Move up"
            disabled={busy || isFirst}
            onClick={() => onMoveUp(row)}
          >↑</button>
          <button
            className="icon-btn"
            title="Move down"
            disabled={busy || isLast}
            onClick={() => onMoveDown(row)}
          >↓</button>
        </div>
        <button
          className="btn-ghost"
          disabled={busy}
          onClick={() => onToggleActive(row)}
        >
          {row.active ? 'Hide' : 'Show'}
        </button>
        <button
          className="btn-ghost danger"
          disabled={busy}
          onClick={() => onRemove(row)}
        >
          Remove
        </button>
      </div>
    </li>
  )
}

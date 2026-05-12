export default function PlayerPickerModal({ query, results, usedIds, onSearch, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal card panel">
        <div className="modal-header">
          <div>
            <div className="modal-title">Add a player</div>
            <div className="modal-sub">Type a name, then pick a result to add.</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <input
          className="search-input"
          value={query}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search players..."
          autoFocus
        />

        <div className="results">
          {!query.trim() ? (
            <p className="results-hint">Type to search players...</p>
          ) : results.length === 0 ? (
            <p className="results-hint">No matches found.</p>
          ) : (
            results.map(p => {
              const disabled = !!usedIds[p.player_id]
              return (
                <button
                  key={p.player_id}
                  type="button"
                  className={'result-item' + (disabled ? ' disabled' : '')}
                  onClick={() => onSelect(p.player_id)}
                  disabled={disabled}
                >
                  <span className="result-name">{p.player_name}</span>
                  <span className="result-sub">{p.team}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConferenceFilter({ value, onChange, options = ['All', 'East', 'West'] }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {options.map(conf => (
        <button
          key={conf}
          type="button"
          className="btn"
          style={value === conf ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white', border: 'none' } : {}}
          onClick={() => onChange(conf)}
        >
          {conf}
        </button>
      ))}
    </div>
  )
}

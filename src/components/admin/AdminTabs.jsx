export default function AdminTabs({ tabs, active, onChange }) {
  return (
    <div className="admin-tabs">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={'admin-tab' + (active === t.id ? ' active' : '')}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {typeof t.count === 'number' && (
            <span className="admin-tab-count">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

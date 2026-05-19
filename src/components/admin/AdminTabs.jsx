export default function AdminTabs({ tabs, active, onChange }) {
  return (
    <div className="admin-tabs" role="tablist">
      {tabs.map((t) => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            className={'admin-tab' + (isActive ? ' active' : '')}
            onClick={() => onChange(t.id)}
          >
            {t.icon && <span className="admin-tab-icon" aria-hidden="true">{t.icon}</span>}
            <span className="admin-tab-label">{t.label}</span>
            {typeof t.count === 'number' && (
              <span className="admin-tab-count">{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

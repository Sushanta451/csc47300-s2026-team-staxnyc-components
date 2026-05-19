import { useState } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import PendingRequestsPanel from '../components/admin/PendingRequestsPanel'
import FeaturedPlayersPanel from '../components/admin/FeaturedPlayersPanel'

export default function AdminPage() {
  const [active, setActive] = useState('requests')
  const [pendingCount, setPendingCount] = useState(null)
  const [featuredCount, setFeaturedCount] = useState(null)

  const tabs = [
    { id: 'requests', label: 'Pending Requests', icon: '', count: pendingCount },
    { id: 'featured', label: 'Featured Players', icon: '', count: featuredCount },
  ]

  return (
    <main className="container admin-shell">
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-eyebrow">Command Center</span>
          <h1 className="admin-title">Admin</h1>
          <p className="admin-subtitle">
            Review profile changes and curate the homepage starting lineup.
          </p>
        </div>
        <div className="admin-stat-strip">
          <div className="admin-stat">
            <span className="admin-stat-num">{pendingCount ?? '—'}</span>
            <span className="admin-stat-label">Pending</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-num">{featuredCount ?? '—'}</span>
            <span className="admin-stat-label">Featured</span>
          </div>
        </div>
      </header>

      <AdminTabs tabs={tabs} active={active} onChange={setActive} />

      <section className="admin-panel-wrap">
        {active === 'requests' && (
          <PendingRequestsPanel onCountChange={setPendingCount} />
        )}
        {active === 'featured' && (
          <FeaturedPlayersPanel onCountChange={setFeaturedCount} />
        )}
      </section>
    </main>
  )
}

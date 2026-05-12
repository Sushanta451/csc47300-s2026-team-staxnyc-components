import { useState } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import PendingRequestsPanel from '../components/admin/PendingRequestsPanel'
import FeaturedPlayersPanel from '../components/admin/FeaturedPlayersPanel'

export default function AdminPage() {
  const [active, setActive] = useState('requests')
  const [pendingCount, setPendingCount] = useState(null)

  const tabs = [
    { id: 'requests', label: 'Pending Requests', count: pendingCount },
    { id: 'featured', label: 'Featured Players' },
  ]

  return (
    <main className="container">
      <section className="page-header">
        <h1>Admin</h1>
        <p style={{ color: 'var(--muted)' }}>
          Approve profile changes and curate the homepage featured players.
        </p>
      </section>

      <AdminTabs tabs={tabs} active={active} onChange={setActive} />

      <section style={{ marginTop: '1.25rem' }}>
        {active === 'requests' && (
          <PendingRequestsPanel onCountChange={setPendingCount} />
        )}
        {active === 'featured' && <FeaturedPlayersPanel />}
      </section>
    </main>
  )
}

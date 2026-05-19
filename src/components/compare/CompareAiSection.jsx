import { useMemo, useState } from 'react'
import { buildLocalComparisonNarrative } from '../../lib/compareInsights'

export default function CompareInsightsSection({ players }) {
  const [open, setOpen] = useState(false)
  const visible = Array.isArray(players) ? players : []

  const narrative = useMemo(
    () => (visible.length >= 2 ? buildLocalComparisonNarrative(visible) : ''),
    [visible],
  )

  if (visible.length < 2) return null

  return (
    <section className="card panel compare-ai-section">
      <div className="compare-ai-head">
        <div>
          <h2 className="compare-ai-title">Stat summary</h2>
          <p className="compare-ai-sub">Written breakdown of how these players stack up on the chart stats.</p>
        </div>
        <button
          type="button"
          className="btn primary compare-ai-btn"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Hide summary' : 'Show summary'}
        </button>
      </div>
      {open && (
        <div className="compare-ai-body">
          <p className="compare-ai-narrative">{narrative}</p>
        </div>
      )}
    </section>
  )
}

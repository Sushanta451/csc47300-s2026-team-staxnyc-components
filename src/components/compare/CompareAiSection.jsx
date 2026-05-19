import { useMemo, useState } from 'react'
import { buildLocalComparisonNarrative } from '../../lib/compareInsights'

export default function CompareAiSection({ players }) {
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
          <h2 className="compare-ai-title">AI comparison</h2>
          <p className="compare-ai-sub">
            After you add players and the radar updates, generate a written breakdown. Uses on-device
            stat logic today; replace with your model behind <code className="compare-ai-code">/api/compare-insights</code> when ready.
          </p>
        </div>
        <button
          type="button"
          className="btn primary compare-ai-btn"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Hide insights' : 'Explain comparison'}
        </button>
      </div>
      {open && (
        <div className="compare-ai-body">
          <p className="compare-ai-narrative">{narrative}</p>
          <p className="compare-ai-footnote">
            Next step for real AI: add a Supabase Edge Function (or other server) that accepts player IDs,
            loads stats server-side, calls OpenAI/Anthropic with a structured prompt, and returns text — never
            expose provider API keys in <code className="compare-ai-code">VITE_*</code> env vars.
          </p>
        </div>
      )}
    </section>
  )
}

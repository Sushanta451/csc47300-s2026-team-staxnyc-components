import { useState } from 'react'
import { buildLocalComparisonNarrative } from '../../lib/compareInsights'

export default function CompareAiSection({ players }) {
  const visible = Array.isArray(players) ? players : []
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState('')

  if (visible.length < 2) return null

  async function loadAnalysis() {
    setLoading(true); setError(''); setAnalysis('')
    try {
      const resp = await fetch('/api/compare-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: visible }),
      })
      const ct = resp.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        setAnalysis(buildLocalComparisonNarrative(visible))
        setError('AI analysis only works on the deployed site. Showing local summary instead.')
        return
      }
      const data = await resp.json()
      if (!resp.ok) {
        setAnalysis(buildLocalComparisonNarrative(visible))
        setError(data.error || `Request failed (${resp.status})`)
        return
      }
      setAnalysis(data.analysis || buildLocalComparisonNarrative(visible))
    } catch (err) {
      setAnalysis(buildLocalComparisonNarrative(visible))
      setError(err.message || 'Could not reach the AI service.')
    } finally {
      setLoading(false)
    }
  }

  function handleToggle() {
    const next = !open
    setOpen(next)
    if (next && !analysis && !loading) loadAnalysis()
  }

  return (
    <section className="card panel compare-ai-section">
      <div className="compare-ai-head">
        <div>
          <h2 className="compare-ai-title">AI Analysis</h2>
          <p className="compare-ai-sub">
            DeepSeek breaks down how these players stack up.
          </p>
        </div>
        <button
          type="button"
          className="btn primary compare-ai-btn"
          onClick={handleToggle}
          disabled={loading}
        >
          {open ? 'Hide analysis' : loading ? 'Thinking…' : 'Show analysis'}
        </button>
      </div>

      {open && (
        <div className="compare-ai-body">
          {loading && !analysis && (
            <p className="compare-ai-loading">Asking DeepSeek to compare these players…</p>
          )}
          {analysis && (
            <p className="compare-ai-narrative">{analysis}</p>
          )}
          {error && (
            <p className="compare-ai-error">{error}</p>
          )}
          {analysis && !loading && (
            <button
              type="button"
              className="btn-ghost compare-ai-refresh"
              onClick={loadAnalysis}
            >
              Regenerate
            </button>
          )}
        </div>
      )}
    </section>
  )
}

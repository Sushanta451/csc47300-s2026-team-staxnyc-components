import { useEffect, useRef, useState } from 'react'

export default function AskAboutPredictionModal({ gameId, homeTeam, awayTeam, prediction, onClose }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [localDev, setLocalDev] = useState(false)
  const inputRef = useRef(null)

  const pickedTeam = prediction?.prediction === 'home' ? homeTeam : awayTeam
  const probPct = typeof prediction?.home_win_prob === 'number'
    ? (prediction.home_win_prob * 100).toFixed(1) + '%'
    : '--'

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    inputRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    const q = question.trim()
    if (!q || loading) return
    setLoading(true)
    setError('')
    setAnswer('')
    setLocalDev(false)
    try {
      const res = await fetch('/api/ask-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, question: q })
      })
      // Vite dev server returns index.html (200, html) for unknown routes; treat 404 or html as local-dev
      const ct = res.headers.get('content-type') || ''
      if (res.status === 404 || !ct.includes('application/json')) {
        setLocalDev(true)
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error || 'Request failed (' + res.status + ')')
        return
      }
      setAnswer(json?.answer || '')
    } catch (err) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal card panel ask-modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Why does the model favor {pickedTeam}?</div>
            <div className="modal-sub">Home win probability: {probPct}</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="ask-rationale">
          <div className="ask-label">Model rationale</div>
          <div className="ask-rationale-text">{prediction?.rationale || 'No rationale recorded.'}</div>
        </div>

        <form className="ask-form" onSubmit={submit}>
          <label className="ask-label" htmlFor="ask-input">Ask a follow-up question</label>
          <div className="ask-row">
            <input
              id="ask-input"
              ref={inputRef}
              className="search-input ask-input"
              type="text"
              placeholder="e.g. What about Anthony Davis being out?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="ask-submit" disabled={loading || !question.trim()}>
              {loading ? 'Asking...' : 'Submit'}
            </button>
          </div>
        </form>

        <div className="ask-answer" aria-live="polite">
          {loading && <div className="ask-loading">Thinking with DeepSeek Reasoner...</div>}
          {!loading && localDev && (
            <div className="ask-info">
              This feature requires deployment to Vercel. Locally, you can read the existing rationale above.
            </div>
          )}
          {!loading && error && (
            <div className="ask-error">
              {error}
              <button type="button" className="ask-retry" onClick={submit}>Retry</button>
            </div>
          )}
          {!loading && answer && (
            <div className="ask-answer-body">
              <div className="ask-label">Answer</div>
              <div className="ask-answer-text">{answer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

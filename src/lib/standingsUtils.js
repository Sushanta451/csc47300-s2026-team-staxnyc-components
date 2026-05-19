/** Normalize conference labels from DB or static seed data. */
export function normalizeConference(value) {
  const s = String(value || '').trim().toLowerCase()
  if (s.startsWith('east')) return 'East'
  if (s.startsWith('west')) return 'West'
  return value
}

/** Sort standings by official rank, then record. */
export function sortStandingsRows(list) {
  return (list || []).slice().sort((a, b) => {
    const rankA = Number(a.rank)
    const rankB = Number(b.rank)
    const ra = Number.isFinite(rankA) && rankA > 0 ? rankA : 999
    const rb = Number.isFinite(rankB) && rankB > 0 ? rankB : 999
    if (ra !== rb) return ra - rb
    if (b.wins !== a.wins) return b.wins - a.wins
    return (b.pct || 0) - (a.pct || 0)
  })
}

/** #1 team in a conference (Pistons East, Thunder West in current DB). */
export function pickConferenceLeader(confRows) {
  const sorted = sortStandingsRows(confRows)
  return sorted[0] || null
}

export function filterConferenceRows(rows, conference) {
  const target = normalizeConference(conference)
  return (rows || []).filter((r) => normalizeConference(r.conference) === target)
}

/** True when a position string is usable for display (not placeholder / empty). */
export function hasMeaningfulPosition(position) {
  if (position == null) return false
  const t = String(position).trim()
  if (!t) return false
  const lower = t.toLowerCase()
  if (lower === '—' || lower === '-' || lower === 'n/a' || lower === 'na' || lower === 'null' || lower === 'unknown') {
    return false
  }
  return true
}

export function anyPlayerHasPosition(players) {
  return Array.isArray(players) && players.some((p) => hasMeaningfulPosition(p?.position))
}

export function formatPlayerMeta(teamLabel, position) {
  const team = teamLabel || null
  const pos = hasMeaningfulPosition(position) ? String(position).trim() : null
  if (team && pos) return `${team} · ${pos}`
  if (team) return team
  if (pos) return pos
  return '—'
}

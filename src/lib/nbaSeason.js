/** Current NBA season string as used by nba_api / our tables (e.g. 2025-26). */
export function currentNbaSeasonSlug(d = new Date()) {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const start = m >= 10 ? y : y - 1
  return `${start}-${String(start + 1).slice(2)}`
}

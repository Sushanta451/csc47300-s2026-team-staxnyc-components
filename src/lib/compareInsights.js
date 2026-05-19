import { formatCompareStat, rawStatValue, STAT_KEYS, statLabel } from './compareStats'

export function buildLocalComparisonNarrative(players) {
  if (!players?.length) return ''
  const names = players.map((p) => p.player_name).join(', ')
  const chunks = [
    `Comparing ${names} on per-game scoring, rebounding, playmaking, shooting, and defense.`,
  ]

  const sortedPpg = [...players].sort((a, b) => rawStatValue(b, 'ppg') - rawStatValue(a, 'ppg'))
  if (rawStatValue(sortedPpg[0], 'ppg') > 0) {
    chunks.push(
      `${sortedPpg[0].player_name} leads the group in PPG (${formatCompareStat('ppg', sortedPpg[0].ppg)}).`,
    )
  }

  for (const key of STAT_KEYS) {
    let best = players[0]
    let bestVal = rawStatValue(best, key)
    for (const p of players) {
      const v = rawStatValue(p, key)
      if (v > bestVal) {
        best = p
        bestVal = v
      }
    }
    if (bestVal <= 0) continue
    const tied = players.filter((p) => rawStatValue(p, key) === bestVal)
    if (tied.length === 1) {
      chunks.push(`Best ${statLabel(key)}: ${best.player_name} (${formatCompareStat(key, best[key])}).`)
    }
  }

  if (players.length === 2) {
    const [a, b] = players
    chunks.push(
      `Head-to-head: ${a.player_name} (${a.team}) vs ${b.player_name} (${b.team}) — use the radar overlay to see where each profile is stronger.`,
    )
  }

  return chunks.join('\n\n')
}

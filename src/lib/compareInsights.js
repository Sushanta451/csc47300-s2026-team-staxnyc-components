const STAT_KEYS = ['ppg', 'rpg', 'apg', 'fg_pct']
const LABELS = { ppg: 'PPG', rpg: 'RPG', apg: 'APG', fg_pct: 'FG%' }

export function buildLocalComparisonNarrative(players) {
  if (!players?.length) return ''
  const names = players.map((p) => p.player_name).join(', ')
  const chunks = [`Comparing ${names} on per-game scoring, glass, playmaking, and shooting efficiency.`]

  const sortedPpg = [...players].sort((a, b) => (parseFloat(b.ppg) || 0) - (parseFloat(a.ppg) || 0))
  chunks.push(`${sortedPpg[0].player_name} leads the group in PPG (${sortedPpg[0].ppg}).`)

  for (const key of STAT_KEYS) {
    let best = players[0]
    let bestVal = parseFloat(best[key]) || 0
    for (const p of players) {
      const v = parseFloat(p[key]) || 0
      if (v > bestVal) {
        best = p
        bestVal = v
      }
    }
    const tied = players.filter((p) => (parseFloat(p[key]) || 0) === bestVal)
    if (tied.length === 1) {
      const disp = key === 'fg_pct' ? `${best[key]}%` : String(best[key])
      chunks.push(`Best ${LABELS[key]}: ${best.player_name} (${disp}).`)
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

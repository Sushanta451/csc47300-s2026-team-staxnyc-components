/** Distinct colors for compare chart / cards (readable on dark UI). */
const COMPARE_PALETTE = [
  '#5b8cff',
  '#f472b6',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#fb923c',
  '#22d3ee',
  '#f87171',
  '#4ade80',
  '#e879f9',
  '#fcd34d',
  '#60a5fa',
  '#c084fc',
  '#2dd4bf',
  '#fb7185',
]

function hslToHex(h, s, l) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function randomDistinctHex(used) {
  for (let i = 0; i < 48; i++) {
    const h = Math.floor(Math.random() * 360)
    const s = 62 + Math.floor(Math.random() * 28)
    const l = 52 + Math.floor(Math.random() * 18)
    const hex = hslToHex(h, s, l)
    if (!used.has(hex)) return hex
  }
  return COMPARE_PALETTE[used.size % COMPARE_PALETTE.length]
}

/** Pick a color not already assigned to another compared player. */
export function pickUniqueCompareColor(colorByPlayerId = {}) {
  const used = new Set(
    Object.values(colorByPlayerId)
      .map((c) => (c ? String(c).toLowerCase() : ''))
      .filter(Boolean),
  )

  const available = COMPARE_PALETTE.filter((c) => !used.has(c.toLowerCase()))
  if (available.length) {
    return available[Math.floor(Math.random() * available.length)]
  }

  return randomDistinctHex(used)
}

/** Stats shown on the compare radar (order = axis positions). */
export const STAT_KEYS = ['ppg', 'rpg', 'apg', 'fg_pct', 'spg', 'bpg']

const PERCENT_KEYS = new Set(['fg_pct', 'three_pct', 'ft_pct'])

const LABELS = {
  ppg: 'PPG',
  rpg: 'RPG',
  apg: 'APG',
  fg_pct: 'FG%',
  spg: 'SPG',
  bpg: 'BPG',
  three_pct: '3P%',
  ft_pct: 'FT%',
  mpg: 'MPG',
  tpg: 'TOV',
}

const TOOLTIPS = {
  ppg: 'Points per game',
  rpg: 'Rebounds per game',
  apg: 'Assists per game',
  fg_pct: 'Field goal percentage',
  spg: 'Steals per game',
  bpg: 'Blocks per game',
  three_pct: 'Three-point percentage',
  ft_pct: 'Free throw percentage',
  mpg: 'Minutes per game',
  tpg: 'Turnovers per game',
}

/** Fallback caps when a stat is zero across the comparison group. */
const REF_MAX = {
  ppg: 35,
  rpg: 15,
  apg: 12,
  fg_pct: 100,
  spg: 2.5,
  bpg: 4,
  three_pct: 100,
  ft_pct: 100,
  mpg: 40,
  tpg: 5,
}

/** Visual stretch so radar polygons fill the chart (not tiny in the center). */
const RADAR_FLOOR = 0.42
const RADAR_GAMMA = 0.62

function exaggerateRadarNorm(rawNorm) {
  if (rawNorm <= 0) return 0
  const curved = Math.pow(Math.min(1, rawNorm), RADAR_GAMMA)
  return RADAR_FLOOR + (1 - RADAR_FLOOR) * curved
}

export function statLabel(key) {
  return LABELS[key] || key.toUpperCase()
}

export function statTooltip(key) {
  return TOOLTIPS[key] || statLabel(key)
}

export function formatCompareStat(key, value) {
  if (value == null || value === '') return '—'
  if (PERCENT_KEYS.has(key)) return `${value}%`
  return String(value)
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function parseNum(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

/** Treat 0 as missing for season counting stats when the row looks partially synced. */
function isSeasonStatMissing(key, value, player) {
  const n = parseNum(value)
  if (n == null) return true
  if (n !== 0) return false
  const partial =
    (parseNum(player.spg) || 0) > 0 ||
    (parseNum(player.bpg) || 0) > 0 ||
    (parseNum(player.three_pct) || 0) > 0 ||
    (parseNum(player.ft_pct) || 0) > 0 ||
    (parseNum(player.games_played) || 0) > 0
  return ['ppg', 'rpg', 'apg', 'fg_pct', 'mpg', 'three_pct', 'ft_pct', 'tpg', 'games_played'].includes(key) && partial
}

function averagesFromGames(games) {
  if (!games?.length) return null
  const n = games.length
  let pts = 0
  let reb = 0
  let ast = 0
  let stl = 0
  let blk = 0
  let tov = 0
  let fgm = 0
  let fga = 0
  let fg3m = 0
  let fg3a = 0
  let ftm = 0
  let fta = 0
  let min = 0
  let minCount = 0
  let tovCount = 0

  for (const g of games) {
    pts += parseNum(g.pts) || 0
    reb += parseNum(g.reb) || 0
    ast += parseNum(g.ast) || 0
    stl += parseNum(g.stl) || 0
    blk += parseNum(g.blk) || 0
    fgm += parseNum(g.fgm) || 0
    fga += parseNum(g.fga) || 0
    fg3m += parseNum(g.fg3m) ?? parseNum(g.fg3_made) ?? parseNum(g.three_pm) ?? 0
    fg3a += parseNum(g.fg3a) ?? parseNum(g.fg3_att) ?? parseNum(g.three_pa) ?? 0
    ftm += parseNum(g.ftm) || 0
    fta += parseNum(g.fta) || 0
    const t = parseNum(g.tov) ?? parseNum(g.turnover) ?? parseNum(g.to)
    if (t != null) {
      tov += t
      tovCount += 1
    }
    const m = parseNum(g.min)
    if (m != null) {
      min += m
      minCount += 1
    }
  }

  return {
    games_played: n,
    ppg: round1(pts / n),
    rpg: round1(reb / n),
    apg: round1(ast / n),
    spg: round1(stl / n),
    bpg: round1(blk / n),
    tpg: tovCount > 0 ? round1(tov / tovCount) : null,
    fg_pct: fga > 0 ? round1((fgm / fga) * 100) : null,
    three_pct: fg3a > 0 ? round1((fg3m / fg3a) * 100) : null,
    ft_pct: fta > 0 ? round1((ftm / fta) * 100) : null,
    mpg: minCount > 0 ? round1(min / minCount) : null,
  }
}

/** Fill missing/zero season stats from game logs (profile, compare, featured). */
export function enrichPlayerForCompare(player, games = []) {
  if (!player) return player
  const out = { ...player }
  const fromGames = averagesFromGames(games)
  if (!fromGames) return out

  const fillKeys = [
    'ppg', 'rpg', 'apg', 'fg_pct', 'spg', 'bpg', 'mpg',
    'three_pct', 'ft_pct', 'tpg', 'games_played',
  ]

  for (const key of fillKeys) {
    if (fromGames[key] == null) continue
    if (isSeasonStatMissing(key, out[key], out)) {
      out[key] = fromGames[key]
    }
  }

  return out
}

export function rawStatValue(player, key) {
  return parseNum(player?.[key]) || 0
}

export function playerHasCompareStats(player) {
  return STAT_KEYS.some((key) => rawStatValue(player, key) > 0)
}

export function buildRadarSeries(players, { visibleIds, colors }) {
  const visible = players.filter((p) => visibleIds[p.player_id] !== false)
  const scaleGroup = visible.length > 0 ? visible : players

  return players.map((p) => {
    const normValues = STAT_KEYS.map((key) => {
      const val = rawStatValue(p, key)
      if (val <= 0) return 0

      const leagueMax = REF_MAX[key] || 1
      let groupMax = 0
      scaleGroup.forEach((sp) => {
        const sv = rawStatValue(sp, key)
        if (sv > groupMax) groupMax = sv
      })

      const ceiling = Math.max(leagueMax, groupMax)
      const rawNorm = val / ceiling
      return exaggerateRadarNorm(rawNorm)
    })

    return {
      playerId: p.player_id,
      name: p.player_name,
      normValues,
      rawValues: STAT_KEYS.map((key) => rawStatValue(p, key)),
      color: colors[p.player_id] || '#5b8cff',
      visible: visibleIds[p.player_id] !== false,
    }
  })
}

/** Values for one radar axis, tagged leader vs rest for tooltips. */
export function buildRadarAxisTooltip(series, axisIndex) {
  const key = STAT_KEYS[axisIndex]
  const entries = (series || [])
    .filter((s) => s.visible && s.rawValues?.length === STAT_KEYS.length)
    .map((s) => ({
      name: s.name,
      value: s.rawValues[axisIndex] || 0,
      color: s.color,
    }))
    .filter((e) => e.value > 0)

  if (!entries.length) return null

  const maxVal = Math.max(...entries.map((e) => e.value))
  return {
    statKey: key,
    statLabel: statLabel(key),
    entries: entries.map((e) => ({
      ...e,
      formatted: formatCompareStat(key, e.value),
      leader: e.value === maxVal,
    })),
  }
}

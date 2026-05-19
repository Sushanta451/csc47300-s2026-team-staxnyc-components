import { teamVariantsForQuery } from './teamBranding'

function parseNum(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

function normTeamName(name) {
  return String(name || '').trim().toLowerCase()
}

function teamIdentity(teamLabel) {
  return teamLabel ? { canonicalName: teamLabel } : null
}

function teamInGame(teamLabel, home, away) {
  const variants = teamVariantsForQuery(teamIdentity(teamLabel))
  const set = new Set(variants.map(normTeamName))
  const h = normTeamName(home)
  const a = normTeamName(away)
  return set.has(h) || set.has(a)
}

function teamWonGame(teamLabel, game) {
  const home = normTeamName(game.home_team)
  const away = normTeamName(game.away_team)
  const variants = teamVariantsForQuery(teamIdentity(teamLabel)).map(normTeamName)
  const isHome = variants.includes(home)
  const isAway = variants.includes(away)
  const hs = parseNum(game.home_score)
  const as = parseNum(game.away_score)
  if (hs == null || as == null) return null
  if (isHome) return hs > as ? 'W' : hs < as ? 'L' : 'T'
  if (isAway) return as > hs ? 'W' : as < hs ? 'L' : 'T'
  return null
}

function teamPointsForGame(teamLabel, game) {
  const home = normTeamName(game.home_team)
  const variants = teamVariantsForQuery(teamIdentity(teamLabel)).map(normTeamName)
  const hs = parseNum(game.home_score)
  const as = parseNum(game.away_score)
  if (hs == null || as == null) return null
  if (variants.includes(home)) return { scored: hs, allowed: as }
  return { scored: as, allowed: hs }
}

function avg(nums) {
  if (!nums.length) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

function rosterAverages(players, key) {
  const vals = (players || [])
    .map((p) => parseNum(p[key]))
    .filter((n) => n != null && n > 0)
  return avg(vals)
}

function parseLast10(last10) {
  if (!last10 || typeof last10 !== 'string') return null
  const m = last10.trim().match(/^(\d+)\s*[-–]\s*(\d+)$/)
  if (!m) return null
  return { wins: Number(m[1]), losses: Number(m[2]) }
}

/**
 * Build display stats for a team roster page from standings, roster, and live games.
 */
export function buildTeamRosterSummary({ teamLabel, standingRow, players = [], liveGames = [] }) {
  const summary = {
    hasStandings: Boolean(standingRow),
    hasLiveGames: false,
    hasRosterStats: false,
  }

  if (standingRow) {
    const wins = Number(standingRow.wins) || 0
    const losses = Number(standingRow.losses) || 0
    const gp = wins + losses
    const pct = standingRow.pct != null
      ? (typeof standingRow.pct === 'number'
        ? standingRow.pct
        : parseFloat(standingRow.pct))
      : (gp > 0 ? wins / gp : null)

    summary.record = `${wins}–${losses}`
    summary.winPct = pct != null && Number.isFinite(pct)
      ? `${(pct <= 1 ? pct * 100 : pct).toFixed(1)}%`
      : null
    summary.conference = standingRow.conference || null
    summary.rank = standingRow.rank != null ? `#${standingRow.rank}` : null
    summary.gb = standingRow.gb != null
      ? (Number(standingRow.gb) === 0 ? '1st / tied' : `${standingRow.gb} GB`)
      : null
    summary.streak = standingRow.streak && standingRow.streak !== '—' ? standingRow.streak : null
    summary.last10 = standingRow.last10 && standingRow.last10 !== '—' ? standingRow.last10 : null
    const l10 = parseLast10(summary.last10)
    if (l10 && l10.wins + l10.losses > 0) {
      summary.last10Pct = `${Math.round((l10.wins / (l10.wins + l10.losses)) * 100)}%`
    }
  }

  const finals = (liveGames || []).filter((g) => {
    const st = String(g.status || '').toLowerCase()
    return st === 'final' || st === 'finished'
  }).filter((g) => teamInGame(teamLabel, g.home_team, g.away_team))

  if (finals.length > 0) {
    summary.hasLiveGames = true
    let w = 0
    let l = 0
    const scored = []
    const allowed = []
    for (const g of finals) {
      const res = teamWonGame(teamLabel, g)
      if (res === 'W') w += 1
      else if (res === 'L') l += 1
      const pts = teamPointsForGame(teamLabel, g)
      if (pts) {
        scored.push(pts.scored)
        allowed.push(pts.allowed)
      }
    }
    summary.liveRecord = `${w}–${l}`
    summary.liveGamesCount = finals.length
    summary.livePpg = avg(scored)
    summary.liveOppPpg = avg(allowed)
  }

  const rosterSize = players.length
  const teamPpg = rosterAverages(players, 'ppg')
  const teamRpg = rosterAverages(players, 'rpg')
  const teamApg = rosterAverages(players, 'apg')

  if (rosterSize > 0) {
    summary.rosterSize = rosterSize
  }
  if (teamPpg != null || teamRpg != null || teamApg != null) {
    summary.hasRosterStats = true
    summary.teamPpg = teamPpg
    summary.teamRpg = teamRpg
    summary.teamApg = teamApg
  }

  return summary
}

/**
 * Full team names for players missing from nba_team_rosters (incomplete sync).
 * Keys are player_stats.player_id strings.
 */
export const PLAYER_TEAM_FALLBACK_BY_ID = {
  '202681': 'Dallas Mavericks', // Kyrie Irving
  '1630169': 'Indiana Pacers', // Tyrese Haliburton
  '203081': 'Milwaukee Bucks', // Damian Lillard
}

export function getPlayerTeamFallback(playerId) {
  if (playerId == null || playerId === '') return null
  return PLAYER_TEAM_FALLBACK_BY_ID[String(playerId)] ?? null
}

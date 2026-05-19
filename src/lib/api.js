import { supabase } from './supabase'
import { teamNameToSlug, teamVariantsForQuery } from './teamBranding'
import { resolveNbaFranchiseId } from './nbaTeamIds'
import { currentNbaSeasonSlug } from './nbaSeason'

export async function getPlayerById(playerId) {
  const { data, error } = await supabase
    .from('player_stats').select('*').eq('player_id', String(playerId)).maybeSingle()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function getPlayerGames(playerId, limit = 15) {
  try {
    const { data, error } = await supabase
      .from('player_games').select('*').eq('player_id', String(playerId))
      .order('game_date', { ascending: false }).limit(limit)
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

export async function searchPlayers(query, limit = 12) {
  const { data, error } = await supabase
    .from('player_stats')
    .select('player_id,player_name,team')
    .ilike('player_name', '*' + query.trim() + '*')
    .limit(limit)
  if (error) throw error
  return data
}

export async function getPlayersForTeamIdentity(identity) {
  const variants = teamVariantsForQuery(identity)
  if (!variants.length) return []
  const { data, error } = await supabase
    .from('player_stats')
    .select('player_id,player_name,team,position,ppg,rpg,apg,jersey_number')
    .in('team', variants)
    .order('player_name', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getTeamRosterByTeamId(teamId, season) {
  if (teamId == null || teamId === '') return []
  const seasonStr = season || currentNbaSeasonSlug()
  const tid = typeof teamId === 'string' ? parseInt(teamId, 10) : teamId
  if (Number.isNaN(tid)) return []

  const { data: roster, error } = await supabase
    .from('nba_team_rosters')
    .select('player_id,player_name,jersey_number,position,height,weight,birth_date,school')
    .eq('team_id', tid)
    .eq('season', seasonStr)
    .order('player_name', { ascending: true })

  if (error || !roster?.length) return []

  const ids = [...new Set(roster.map((r) => r.player_id).filter(Boolean))]
  const { data: statsRows } = await supabase
    .from('player_stats')
    .select('player_id,ppg,rpg,apg')
    .in('player_id', ids)

  const statsById = Object.fromEntries((statsRows || []).map((s) => [String(s.player_id), s]))

  return roster.map((r) => {
    const sid = String(r.player_id)
    const s = statsById[sid]
    const jn = r.jersey_number != null && r.jersey_number !== '' ? r.jersey_number : null
    return {
      player_id: sid,
      player_name: r.player_name,
      team: null,
      position: r.position ?? '—',
      ppg: s?.ppg ?? null,
      rpg: s?.rpg ?? null,
      apg: s?.apg ?? null,
      jersey_number: jn,
      height: r.height ?? null,
      weight: r.weight ?? null,
      birth_date: r.birth_date ?? null,
      school: r.school ?? null,
    }
  })
}

export async function getStandings() {
  try {
    const { data, error } = await supabase
      .from('nba_standings')
      .select('conference,team,rank,wins,losses,pct,gb,streak,last10,team_slug')
      .order('conference', { ascending: true })
      .order('rank', { ascending: true })
    if (error || !data?.length) return []
    return data.map((row) => ({
      conference: row.conference,
      team: row.team,
      team_id: row.team_id != null ? Number(row.team_id) : resolveNbaFranchiseId(row.team),
      rank: row.rank,
      wins: row.wins,
      losses: row.losses,
      pct: typeof row.pct === 'number' ? row.pct : parseFloat(row.pct) || 0,
      gb: row.gb === null || row.gb === undefined ? 0 : Number(row.gb),
      streak: row.streak ?? '—',
      last10: row.last10 ?? '—',
      team_slug: row.team_slug || teamNameToSlug(row.team),
    }))
  } catch {
    return []
  }
}

export async function getGameHighlights(limit = 20) {
  const { data, error } = await supabase
    .from('game_highlights').select('*')
    .order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data
}

export async function getMyChangeRequests(userId) {
  const { data, error } = await supabase
    .from('profile_change_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getPendingRequests() {
  const { data, error } = await supabase
    .from('profile_change_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getProfilesByIds(ids) {
  if (!ids.length) return []
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id,display_name')
    .in('id', ids)
  if (error) throw error
  return data
}

export async function approveChangeRequest(request, reviewerId) {
  const { error: e1 } = await supabase
    .from('user_profiles')
    .update({ [request.field]: request.new_value })
    .eq('id', request.user_id)
  if (e1) throw e1

  const { error: e2 } = await supabase
    .from('profile_change_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: reviewerId })
    .eq('id', request.id)
  if (e2) throw e2
}

export async function rejectChangeRequest(requestId, reviewerId) {
  const { error } = await supabase
    .from('profile_change_requests')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: reviewerId })
    .eq('id', requestId)
  if (error) throw error
}

export async function updateMyProfile(userId, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createChangeRequest(userId, field, newValue) {
  const { data, error } = await supabase
    .from('profile_change_requests')
    .insert({ user_id: userId, field, new_value: newValue })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFeaturedConfig() {
  const { data: rows, error } = await supabase
    .from('featured_players')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  if (!rows.length) return []
  const ids = rows.map((r) => r.player_id)
  const { data: players, error: e2 } = await supabase
    .from('player_stats')
    .select('player_id,player_name,team,position')
    .in('player_id', ids)
  if (e2) throw e2
  const byId = Object.fromEntries(players.map((p) => [p.player_id, p]))
  return rows.map((r) => ({ ...r, player: byId[r.player_id] || null }))
}

export async function getActiveFeaturedPlayers() {
  const { data: rows, error } = await supabase
    .from('featured_players')
    .select('player_id,display_order')
    .eq('active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  if (!rows.length) return []
  const ids = rows.map((r) => r.player_id)
  const { data: players, error: e2 } = await supabase
    .from('player_stats')
    .select('player_id,player_name,team,position')
    .in('player_id', ids)
  if (e2) throw e2
  const byId = Object.fromEntries(players.map((p) => [p.player_id, p]))
  return rows.map((r) => byId[r.player_id]).filter(Boolean)
}

export async function addFeaturedPlayer(playerId, displayOrder) {
  const { error } = await supabase
    .from('featured_players')
    .insert({ player_id: playerId, display_order: displayOrder, active: true })
  if (error) throw error
}

export async function removeFeaturedPlayer(id) {
  const { error } = await supabase.from('featured_players').delete().eq('id', id)
  if (error) throw error
}

export async function updateFeaturedPlayer(id, updates) {
  const { data, error } = await supabase
    .from('featured_players')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Update blocked — your account may not have admin permissions.')
  }
}

export async function getLiveGames(fromDate, toDate) {
  let q = supabase.from('live_games').select('*').order('game_id', { ascending: true })
  if (fromDate) q = q.gte('game_date', fromDate)
  if (toDate) q = q.lt('game_date', toDate)
  const { data, error } = await q
  if (error) throw error
  return data
}

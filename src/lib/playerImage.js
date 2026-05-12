const NBA_CDN_BASE = 'https://cdn.nba.com/headshots/nba/latest/1040x760'
const FALLBACK_IMAGE = '/images/default-player.png'

export function getPlayerImageUrl(player) {
  if (!player) return FALLBACK_IMAGE
  if (player.image_url) return player.image_url
  if (player.player_id) return `${NBA_CDN_BASE}/${player.player_id}.png`
  return FALLBACK_IMAGE
}

export function getPlayerInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
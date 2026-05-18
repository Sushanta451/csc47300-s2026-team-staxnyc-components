/**
 * playerImage.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility for resolving player headshot URLs dynamically.
 *
 * Strategy: use the official NBA CDN which hosts headshots for every player
 * keyed by their NBA player ID (the same `player_id` already in your DB).
 *
 * URL format:
 *   https://cdn.nba.com/headshots/nba/latest/1040x760/{player_id}.png
 *
 * Fallback chain (in order):
 *   1. image_url field from DB (if you ever add custom overrides)
 *   2. NBA CDN URL built from player_id
 *   3. Local /images/default-player.png
 *
 * Usage:
 *   import { getPlayerImageUrl } from '../lib/playerImage'
 *   <img src={getPlayerImageUrl(player)} alt={player.player_name} />
 */

// Official NBA headshot CDN — works for any active/historical player by ID
const NBA_CDN_BASE = 'https://cdn.nba.com/headshots/nba/latest/1040x760'

// Local fallback shown when CDN image fails to load
const FALLBACK_IMAGE = '/images/default-player.png'

/**
 * Returns the best available image URL for a player.
 *
 * @param {object} player - a row from your player_stats table
 * @param {string|number} player.player_id  - NBA player ID (required)
 * @param {string} [player.image_url]       - optional custom URL stored in DB
 * @returns {string} image URL to use in an <img src>
 */
export function getPlayerImageUrl(player) {
  if (!player) return FALLBACK_IMAGE

  // 1. Use a custom URL stored in the database if present
  if (player.image_url) return player.image_url

  // 2. Build the NBA CDN URL from the player's NBA ID
  if (player.player_id) {
    return `${NBA_CDN_BASE}/${player.player_id}.png`
  }

  // 3. Nothing available — use local placeholder
  return FALLBACK_IMAGE
}

/**
 * Returns the initials of a player's name for use in avatar fallbacks.
 * e.g. "LeBron James" → "LJ"
 *
 * @param {string} name
 * @returns {string}
 */
export function getPlayerInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

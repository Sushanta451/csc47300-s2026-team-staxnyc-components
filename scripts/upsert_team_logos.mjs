/**
 * Upsert logo_url on nba_standings from tricode → ESPN CDN mapping.
 * nba_api does not expose logo URLs; we derive them from team abbreviations.
 *
 * Usage: node scripts/upsert_team_logos.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY (or anon with update policy) in .env
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const url = env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL and Supabase key in .env')
  process.exit(1)
}

const ABBR_BY_TEAM_NAME = {
  'Atlanta Hawks': 'atl',
  'Boston Celtics': 'bos',
  'Brooklyn Nets': 'bkn',
  'Charlotte Hornets': 'cha',
  'Chicago Bulls': 'chi',
  'Cleveland Cavaliers': 'cle',
  'Dallas Mavericks': 'dal',
  'Denver Nuggets': 'den',
  'Detroit Pistons': 'det',
  'Golden State Warriors': 'gsw',
  'Houston Rockets': 'hou',
  'Indiana Pacers': 'ind',
  'Los Angeles Clippers': 'lac',
  'Los Angeles Lakers': 'lal',
  'Memphis Grizzlies': 'mem',
  'Miami Heat': 'mia',
  'Milwaukee Bucks': 'mil',
  'Minnesota Timberwolves': 'min',
  'New Orleans Pelicans': 'nop',
  'New York Knicks': 'nyk',
  'Oklahoma City Thunder': 'okc',
  'Orlando Magic': 'orl',
  'Philadelphia 76ers': 'phi',
  'Phoenix Suns': 'phx',
  'Portland Trail Blazers': 'por',
  'Sacramento Kings': 'sac',
  'San Antonio Spurs': 'sas',
  'Toronto Raptors': 'tor',
  'Utah Jazz': 'uta',
  'Washington Wizards': 'wsh',
}

function logoUrlForTricode(tri) {
  return `https://a.espncdn.com/i/teamlogos/nba/500/${tri}.png`
}

const sb = createClient(url, key)
const { data: rows, error } = await sb.from('nba_standings').select('team,team_id')
if (error) {
  console.error(error)
  process.exit(1)
}

let ok = 0
for (const row of rows || []) {
  const tri = ABBR_BY_TEAM_NAME[row.team]
  if (!tri) {
    console.warn('No tricode for', row.team)
    continue
  }
  const logo_url = logoUrlForTricode(tri)
  const { error: upErr } = await sb.from('nba_standings').update({ logo_url }).eq('team', row.team)
  if (upErr) console.error(row.team, upErr.message)
  else ok++
}

console.log(`Updated logo_url for ${ok} teams.`)

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

const COLOR_BY_ABBR = {
  atl: '#E03A3E', bos: '#007A33', bkn: '#000000', cha: '#1D1160', chi: '#CE1141',
  cle: '#860038', dal: '#00538C', den: '#0E2240', det: '#C8102E', gsw: '#1D428A',
  hou: '#CE1141', ind: '#002D62', lac: '#C8102E', lal: '#552583', mem: '#5D76A9',
  mia: '#98002E', mil: '#00471B', min: '#0C2340', nop: '#0C2340', nyk: '#006BB6',
  okc: '#007AC1', orl: '#0077C0', phi: '#006BB6', phx: '#1D1160', por: '#E03A3E',
  sac: '#5A2D81', sas: '#C4CED4', tor: '#CE1141', uta: '#002B5C', wsh: '#002B5C',
}

const ABBR_ALIASES = Object.fromEntries(
  Object.entries(ABBR_BY_TEAM_NAME).map(([fullName, tri]) => [tri.toUpperCase(), fullName]),
)

export function teamNameToSlug(teamName) {
  if (!teamName) return ''
  return String(teamName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function slugToTeamName(slug, standingsRows) {
  if (!slug || !standingsRows?.length) return null
  const want = String(slug).toLowerCase()
  const row = standingsRows.find((r) => teamNameToSlug(r.team) === want)
  return row?.team ?? null
}

export function getTeamIdentityFromSlug(slug, standingsRows) {
  if (!slug || !standingsRows?.length) return null
  const want = String(slug).toLowerCase()
  const row = standingsRows.find((r) => teamNameToSlug(r.team) === want)
  if (!row?.team) return null
  const raw = String(row.team).trim()
  const upper = raw.toUpperCase()

  const fullFromAbbr = ABBR_ALIASES[upper]
  if (fullFromAbbr) {
    return { canonicalName: fullFromAbbr, tricode: ABBR_BY_TEAM_NAME[fullFromAbbr] || null }
  }

  const tricode = ABBR_BY_TEAM_NAME[raw] || null
  return { canonicalName: raw, tricode }
}

export function teamVariantsForQuery(identity) {
  if (!identity?.canonicalName) return []
  const out = new Set([identity.canonicalName])
  if (identity.tricode) {
    const t = identity.tricode
    out.add(t.toLowerCase())
    out.add(t.toUpperCase())
  }
  return [...out]
}

export function getTeamBranding(teamField) {
  if (!teamField) return null
  const raw = String(teamField).trim()
  const upper = raw.toUpperCase()
  let fullName = ABBR_ALIASES[upper] || null
  if (!fullName) {
    const matchKey = Object.keys(ABBR_BY_TEAM_NAME).find(
      (k) => k.toLowerCase() === raw.toLowerCase(),
    )
    fullName = matchKey || null
  }
  if (!fullName) return null
  const abbr = ABBR_BY_TEAM_NAME[fullName]
  if (!abbr) return null
  const color = COLOR_BY_ABBR[abbr] || '#1e3a5f'
  const logoUrl = `https://a.espncdn.com/i/teamlogos/nba/500/${abbr}.png`
  return { abbr, color, logoUrl, fullName }
}

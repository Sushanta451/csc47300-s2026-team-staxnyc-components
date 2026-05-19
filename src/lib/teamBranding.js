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

/** Short slugs from nba_standings.team_slug (nickname-style). */
const NICKNAME_SLUG_TO_FULL = {
  hawks: 'Atlanta Hawks',
  celtics: 'Boston Celtics',
  nets: 'Brooklyn Nets',
  hornets: 'Charlotte Hornets',
  bulls: 'Chicago Bulls',
  cavaliers: 'Cleveland Cavaliers',
  mavericks: 'Dallas Mavericks',
  nuggets: 'Denver Nuggets',
  pistons: 'Detroit Pistons',
  warriors: 'Golden State Warriors',
  rockets: 'Houston Rockets',
  pacers: 'Indiana Pacers',
  clippers: 'Los Angeles Clippers',
  'la-clippers': 'Los Angeles Clippers',
  'los-angeles-clippers': 'Los Angeles Clippers',
  lakers: 'Los Angeles Lakers',
  grizzlies: 'Memphis Grizzlies',
  heat: 'Miami Heat',
  bucks: 'Milwaukee Bucks',
  timberwolves: 'Minnesota Timberwolves',
  pelicans: 'New Orleans Pelicans',
  knicks: 'New York Knicks',
  thunder: 'Oklahoma City Thunder',
  magic: 'Orlando Magic',
  sixers: 'Philadelphia 76ers',
  '76ers': 'Philadelphia 76ers',
  suns: 'Phoenix Suns',
  blazers: 'Portland Trail Blazers',
  kings: 'Sacramento Kings',
  spurs: 'San Antonio Spurs',
  raptors: 'Toronto Raptors',
  jazz: 'Utah Jazz',
  wizards: 'Washington Wizards',
}

function identityFromTeamName(fullName) {
  if (!fullName) return null
  const canonical = String(fullName).trim()
  return {
    canonicalName: canonical,
    tricode: ABBR_BY_TEAM_NAME[canonical] || null,
  }
}

export function isTeamLabelMissing(teamField) {
  if (teamField == null) return true
  const t = String(teamField).trim()
  return !t || t === 'N/A' || t === 'NA' || t === '—' || t === '-'
}

export function formatTeamLabel(teamField) {
  if (isTeamLabelMissing(teamField)) return null
  const raw = String(teamField).trim()
  const branding = getTeamBranding(raw)
  if (branding?.fullName) return branding.fullName
  if (ABBR_BY_TEAM_NAME[raw]) return raw
  const lower = raw.toLowerCase()
  if (NICKNAME_SLUG_TO_FULL[lower]) return NICKNAME_SLUG_TO_FULL[lower]
  return raw
}

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
  if (!slug) return null
  const want = String(slug).toLowerCase().trim()
  if (!want) return null

  if (standingsRows?.length) {
    const byStoredSlug = standingsRows.find(
      (r) => r.team_slug && String(r.team_slug).toLowerCase() === want,
    )
    if (byStoredSlug?.team) return identityFromTeamName(byStoredSlug.team)

    const byFullSlug = standingsRows.find((r) => teamNameToSlug(r.team) === want)
    if (byFullSlug?.team) return identityFromTeamName(byFullSlug.team)

    const byTeamName = standingsRows.find(
      (r) => String(r.team).trim().toLowerCase() === want,
    )
    if (byTeamName?.team) return identityFromTeamName(byTeamName.team)
  }

  const fromNickname = NICKNAME_SLUG_TO_FULL[want]
  if (fromNickname) return identityFromTeamName(fromNickname)

  const fromTricode = ABBR_ALIASES[want.toUpperCase()]
  if (fromTricode) return identityFromTeamName(fromTricode)

  return null
}

export function teamVariantsForQuery(identity) {
  if (!identity?.canonicalName) return []
  const out = new Set([identity.canonicalName])
  if (identity.tricode) {
    const t = identity.tricode
    out.add(t.toLowerCase())
    out.add(t.toUpperCase())
  }
  const slug = teamNameToSlug(identity.canonicalName)
  if (slug) out.add(slug)
  for (const [nick, full] of Object.entries(NICKNAME_SLUG_TO_FULL)) {
    if (full === identity.canonicalName) out.add(nick)
  }
  return [...out]
}

/** ESPN CDN logos keyed by tricode (nba_api has team ids/names, not logo assets). */
export function logoUrlForTricode(tricode) {
  if (!tricode) return null
  return `https://a.espncdn.com/i/teamlogos/nba/500/${String(tricode).toLowerCase()}.png`
}

/** NBA.com global logo by franchise id (fallback). */
export function logoUrlForFranchiseId(franchiseId) {
  if (franchiseId == null || franchiseId === '') return null
  return `https://cdn.nba.com/logos/nba/${franchiseId}/global/L/logo.svg`
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
  const logoUrl = logoUrlForTricode(abbr)
  return { abbr, color, logoUrl, fullName }
}

/** Resolve logo for standings / live games (DB url, branding, or franchise CDN). */
export function getTeamLogoUrl(teamField, franchiseId = null, storedLogoUrl = null) {
  if (storedLogoUrl && String(storedLogoUrl).trim()) return String(storedLogoUrl).trim()
  const branding = getTeamBranding(teamField)
  if (branding?.logoUrl) return branding.logoUrl
  if (franchiseId) return logoUrlForFranchiseId(franchiseId)
  return null
}

const FULL_TO_NICKNAME_SLUG = {}
for (const [nick, full] of Object.entries(NICKNAME_SLUG_TO_FULL)) {
  if (!FULL_TO_NICKNAME_SLUG[full] || nick.length < FULL_TO_NICKNAME_SLUG[full].length) {
    FULL_TO_NICKNAME_SLUG[full] = nick
  }
}

/** Display nickname e.g. "Pistons", "Thunder". */
export function teamNickname(teamField) {
  const label = formatTeamLabel(teamField)
  if (!label) return ''
  const parts = label.trim().split(/\s+/)
  return parts[parts.length - 1] || label
}

/** URL slug for /team/:slug/roster (matches nba_standings.team_slug when possible). */
export function teamRosterSlug(teamField) {
  const branding = getTeamBranding(teamField)
  if (branding?.fullName && FULL_TO_NICKNAME_SLUG[branding.fullName]) {
    return FULL_TO_NICKNAME_SLUG[branding.fullName]
  }
  const raw = String(teamField || '').trim().toLowerCase()
  if (NICKNAME_SLUG_TO_FULL[raw]) return raw
  return teamNameToSlug(teamField)
}

export function teamRosterPath(teamField) {
  const slug = teamRosterSlug(teamField)
  return slug ? `/team/${slug}/roster` : null
}

/** Strong team-tinted surface for player cards (roster, compare, featured). */
export function teamCardSurfaceStyle(teamField, { accentOverride } = {}) {
  const branding = getTeamBranding(teamField)
  const accent = accentOverride || branding?.color || '#5b8cff'
  return {
    background: `linear-gradient(165deg, ${accent}cc 0%, ${accent}88 24%, ${accent}55 48%, rgba(10, 14, 26, 0.94) 100%)`,
    borderColor: `${accent}99`,
    boxShadow: `0 12px 32px ${accent}44, inset 0 1px 0 ${accent}44`,
  }
}

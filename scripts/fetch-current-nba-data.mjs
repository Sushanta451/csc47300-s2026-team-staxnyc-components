#!/usr/bin/env node
/**
 * Fetches current NBA team standings + a sample of per-game player rows by **scraping**
 * Basketball-Reference league pages (HTML + cheerio). Respect robots.txt / site terms for production use.
 *
 * Environment:
 *   NBA_SEASON  — BR season id ending year (default: calendar year, e.g. 2026 for 2025–26)
 *
 * Output (gitignored `scripts/output/`):
 *   scraped-standings.json — rows compatible with `src/data/standings.js` shape (streak/last10 as "—")
 *   scraped-players-sample.json — first N player rows (name, team abbr, pos, ppg, …) for DB import reference
 *
 * Usage: npm run fetch:nba-data
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, 'output')

const UA = 'Mozilla/5.0 (compatible; StaxNYC-class-project/1.0; +https://example.local)'

function seasonId() {
  const y = process.env.NBA_SEASON
  if (y) return String(parseInt(y, 10))
  return String(new Date().getFullYear())
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ${url}`)
  return res.text()
}

function parseGb(text) {
  const t = (text || '').trim()
  if (t === '—' || t === '' || t === '-') return 0
  const n = parseFloat(t)
  return Number.isFinite(n) ? n : 0
}

function parseConferenceStandings($, tableId, conference) {
  const rows = []
  $(`#${tableId} tbody tr`).each((idx, tr) => {
    const $tr = $(tr)
    const link = $tr.find('th[data-stat="team_name"] a')
    if (!link.length) return
    const team = link.text().trim()
    const wins = parseInt($tr.find('td[data-stat="wins"]').text(), 10)
    const losses = parseInt($tr.find('td[data-stat="losses"]').text(), 10)
    const pctText = $tr.find('td[data-stat="win_loss_pct"]').text().trim()
    const pct = parseFloat(pctText) || 0
    const gb = parseGb($tr.find('td[data-stat="gb"]').text())
    if (!team || !Number.isFinite(wins)) return
    rows.push({
      rank: rows.length + 1,
      conference,
      team,
      wins,
      losses,
      pct,
      gb,
      streak: '—',
      last10: '—',
    })
  })
  return rows
}

function parsePerGameSample($, limit = 150) {
  const out = []
  $('#per_game_stats tbody tr').each((_, tr) => {
    if (out.length >= limit) return false
    const $tr = $(tr)
    const name = $tr.find('td[data-stat="name_display"] a').text().trim()
    const team = $tr.find('td[data-stat="team_name_abbr"]').text().trim()
    const pos = $tr.find('td[data-stat="pos"]').text().trim()
    const pts = $tr.find('td[data-stat="pts_per_g"]').text().trim()
    if (!name) return
    out.push({
      player_name: name,
      team_abbr: team,
      position: pos,
      ppg: pts,
    })
  })
  return out
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const sid = seasonId()
  const leagueUrl = `https://www.basketball-reference.com/leagues/NBA_${sid}.html`
  const perGameUrl = `https://www.basketball-reference.com/leagues/NBA_${sid}_per_game.html`

  console.log('Fetching', leagueUrl)
  const leagueHtml = await fetchHtml(leagueUrl)
  const $ = cheerio.load(leagueHtml)
  const east = parseConferenceStandings($, 'confs_standings_E', 'East')
  const west = parseConferenceStandings($, 'confs_standings_W', 'West')
  const standings = [...east, ...west]
  const standingsPath = path.join(outDir, 'scraped-standings.json')
  fs.writeFileSync(
    standingsPath,
    JSON.stringify({ source: leagueUrl, season: sid, generatedAt: new Date().toISOString(), rows: standings }, null, 2),
    'utf8',
  )
  console.log('Wrote', standingsPath, `(${standings.length} teams)`)

  console.log('Fetching', perGameUrl)
  const pgHtml = await fetchHtml(perGameUrl)
  const $p = cheerio.load(pgHtml)
  const players = parsePerGameSample($p, 200)
  const playersPath = path.join(outDir, 'scraped-players-sample.json')
  fs.writeFileSync(
    playersPath,
    JSON.stringify({ source: perGameUrl, season: sid, generatedAt: new Date().toISOString(), rows: players }, null, 2),
    'utf8',
  )
  console.log('Wrote', playersPath, `(${players.length} players)`)
  console.log('\nBR uses 3-letter team codes in per_game; map to full names before importing into player_stats.team if your app expects full names.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

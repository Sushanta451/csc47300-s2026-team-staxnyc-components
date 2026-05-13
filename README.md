# csc473-s2026-staxnyc
Refactored 3 features from NBA website

## Local setup (teammates)

1. **Clone** the repo and `cd` into it (folder with `package.json`).
2. **`npm install`**
3. **Environment:** `cp .env.example .env` and fill in Supabase URL, anon key, and `SUPABASE_SERVICE_ROLE_KEY` for syncs. Keep `.env` at the repo root; do not commit it.
4. **Supabase:** Run [`supabase/migrations/20260513000000_nba_standings.sql`](supabase/migrations/20260513000000_nba_standings.sql) and [`supabase/migrations/20260514100000_player_games_rosters.sql`](supabase/migrations/20260514100000_player_games_rosters.sql) once in the SQL Editor (same project as your `.env`).
5. **App:** `npm run dev`
6. **Optional — NBA → Supabase sync:** `npm run sync:nba` (Python + venv are handled by the script). Full checklist, troubleshooting, and flags: **[`docs/NBA_API_SYNC.md`](docs/NBA_API_SYNC.md)**.

## Data refresh (teams / players)

- **NBA.com → Supabase:** `npm run sync:nba` (standings); `npm run sync:nba -- --players` (stats + official rosters); `npm run sync:nba -- --games` (recent game logs). See [`docs/NBA_API_SYNC.md`](docs/NBA_API_SYNC.md).
- **Basketball-Reference scrape (JSON files):** `npm run fetch:nba-data` writes `scripts/output/` (gitignored). Set `NBA_SEASON` (BR ending year, e.g. `2026` for 2025–26) if needed. Map BR `team_abbr` to full `team` strings before importing.

## Live standings (Supabase + NBA.com)

Apply [`supabase/migrations/20260513000000_nba_standings.sql`](supabase/migrations/20260513000000_nba_standings.sql) and [`supabase/migrations/20260514100000_player_games_rosters.sql`](supabase/migrations/20260514100000_player_games_rosters.sql). Populate with **`npm run sync:nba`** / **`--players`** / **`--games`** ([`docs/NBA_API_SYNC.md`](docs/NBA_API_SYNC.md), uses [swar/nba_api](https://github.com/swar/nba_api)) or manually / via BR scrape output as in [`docs/LIVE_STANDINGS.md`](docs/LIVE_STANDINGS.md).

## Team rosters

From **Standings**, click a team name to open `/team/{slug}/roster`. Rosters load from **`nba_team_rosters`** (CommonTeamRoster sync) when present, else from `player_stats` by franchise name / tricode via [`getPlayersForTeamIdentity`](src/lib/api.js) and [`teamBranding.js`](src/lib/teamBranding.js).

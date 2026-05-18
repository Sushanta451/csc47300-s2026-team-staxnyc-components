# Live standings (`nba_standings`)

The standings page loads rows from Supabase table **`nba_standings`** when present and non-empty; otherwise it uses static [`src/data/standings.js`](../src/data/standings.js).

**NBA.com (recommended):** `npm run sync:nba` writes directly into this table using [swar/nba_api](https://github.com/swar/nba_api); see [`NBA_API_SYNC.md`](./NBA_API_SYNC.md).

## Schema

Apply the migration in [`supabase/migrations/20260513000000_nba_standings.sql`](../supabase/migrations/20260513000000_nba_standings.sql) (or run the same SQL in the Supabase SQL editor).

Columns used by the app:

| Column | Type | Notes |
|--------|------|--------|
| `conference` | text | `East` or `West` |
| `team` | text | Full display name (match `player_stats.team` if you use full names) |
| `rank` | int | Conference seed order |
| `wins`, `losses` | int | |
| `pct` | float | e.g. `0.671` |
| `gb` | float | Use `0` for leader |
| `streak`, `last10` | text | Optional; UI shows `—` if null |
| `team_slug` | text | Optional; URL slug if you want stable links separate from `team` |

## How to populate

1. **NBA.com API** — `npm run sync:nba` (see [`NBA_API_SYNC.md`](./NBA_API_SYNC.md)); optional `npm run sync:nba -- --players` for `player_stats`.
2. **Manual** — Insert/update rows in the Table Editor.
3. **Basketball-Reference scrape** — Run `npm run fetch:nba-data` to write `scripts/output/scraped-standings.json`, then import into `nba_standings` (map JSON `rows` to table columns; set `team_slug` from a slugify of `team` if desired).
4. **Automation** — Schedule `sync:nba` or the BR scrape on a server (GitHub Actions `cron`, Supabase Edge Function, etc.); **do not** scrape BR from the browser (CORS / ToS).

After data exists, reload the app; no env change is required beyond normal Supabase keys for the web app. The sync script additionally needs `SUPABASE_SERVICE_ROLE_KEY` (see `NBA_API_SYNC.md`).

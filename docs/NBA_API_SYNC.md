# NBA.com sync (`nba_api`)

This project pulls **live-style** data from NBA.com using the Python package **[nba_api](https://github.com/swar/nba_api)** (MIT), then writes it to **Supabase** so the React app can keep using the existing anon key + RLS.

---

## Run this on your machine (teammates)

Follow these steps **from the repository root** (the folder that contains `package.json` and `.env.example`). Paths below are relative to that root.

### 1. Prerequisites

| Requirement | Notes |
|---------------|--------|
| **Node.js** | LTS (e.g. 18+) — for `npm run sync:nba` and the Vite app. |
| **Python 3** | Must be on your `PATH` as `python3`. The sync script uses `python3 -m venv` to create `scripts/.venv-nba` automatically on first run. |
| **Bash** | `npm run sync:nba` runs `bash scripts/run_nba_sync.sh`. macOS and Linux are fine; on Windows use **Git Bash**, **WSL**, or run the shell script from an environment that provides `bash`. |
| **Network** | First sync installs pip packages; the script calls NBA.com and Supabase over the internet. |

You do **not** need to manually create the venv or `pip install` first — `run_nba_sync.sh` creates `scripts/.venv-nba` if missing and installs `scripts/requirements-nba.txt`.

### 2. Install JavaScript dependencies (once per clone)

```bash
npm install
```

### 3. Environment variables (`.env` at repo root)

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit **`.env`** in the repo root (same folder as `package.json`). **Do not commit `.env`** — it is gitignored.

3. Fill in at least:

   | Variable | Used by | Notes |
   |----------|---------|--------|
   | `VITE_SUPABASE_URL` | Vite app + optional URL for sync | Project URL from Supabase → Settings → API. |
   | `VITE_SUPABASE_KEY` | Vite app only | **Anon / public** key (not the service role). |
   | `SUPABASE_SERVICE_ROLE_KEY` | `npm run sync:nba` only | **Service role** secret from Supabase → Settings → API. **Never** prefix with `VITE_` (that would expose it in the browser). |
   | `SUPABASE_URL` (optional) | Sync script | If omitted, the script uses `VITE_SUPABASE_URL` for the API URL. |

4. **Optional:** `.env.local` — the sync script loads `.env` then `.env.local`. Only **non-empty** values in `.env.local` override `.env`, so an empty `SUPABASE_SERVICE_ROLE_KEY=` there will not wipe a valid key from `.env`.

See [`.env.example`](../.env.example) for a template.

### 4. Supabase: create tables (one time per Supabase project)

The sync writes to **`public.nba_standings`**. If that table does not exist, you will see PostgREST error **`PGRST205`** (“Could not find the table … in the schema cache”).

**Apply the migration** against the **same** Supabase project as your URL and keys:

1. Supabase Dashboard → **SQL Editor**.
2. Open and copy the full contents of [`supabase/migrations/20260513000000_nba_standings.sql`](../supabase/migrations/20260513000000_nba_standings.sql).
3. Run the script once.

If your team uses the Supabase CLI with this repo linked, you can apply migrations with your usual workflow instead (e.g. `supabase db push`).

**Optional `--players`:** Upserts `player_stats`. That table must already exist in your project with a **unique** (or primary) constraint on `player_id` for upserts to succeed.

### 5. Run the sync

From the repo root:

```bash
npm run sync:nba
```

The first run may take a bit longer while pip installs into `scripts/.venv-nba`.

```bash
# Also sync per-game player rows into player_stats (slower)
npm run sync:nba -- --players

# Optional: season override (NBA string format)
NBA_SEASON=2024-25 npm run sync:nba
```

Equivalent without npm:

```bash
bash scripts/run_nba_sync.sh
bash scripts/run_nba_sync.sh --players
```

### 6. Verify

- **Supabase:** Table Editor → schema **`public`** → **`nba_standings`** — you should see rows after a successful sync.
- **App:** Run `npm run dev` and open the standings UI; it should prefer live data when the table is populated (see [`docs/LIVE_STANDINGS.md`](./LIVE_STANDINGS.md)).

### 7. Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `Supabase credentials missing` / `Missing key` | `SUPABASE_SERVICE_ROLE_KEY` is set in **repo root** `.env`, non-empty, correct project. Not the anon key; not a `VITE_` name. |
| `Missing URL` | `SUPABASE_URL` or `VITE_SUPABASE_URL` in `.env`. |
| `PGRST205` / table not in schema cache | Run the `nba_standings` migration SQL on this project. Confirm `.env` points at the same project where you ran it. |
| `zsh: command not found: #` | You pasted a **comment line** starting with `#` as a command. Run only the command lines, or put comments on their own line in a script. |
| Wrong data or empty after “success” | Confirm URL and keys are all for the **same** Supabase project. |

---

## What gets synced

| Target table | Source (nba_api) | When |
|--------------|------------------|------|
| `nba_standings` | `LeagueStandingsV3` | Default every run |
| `player_stats` | `LeagueDashPlayerStats` (PerGame) | Only with `--players` |

Standings rows use **full team names** from `nba_api.stats.static.teams` (e.g. `Los Angeles Lakers`) and a **`team_slug`** compatible with roster URLs (`/team/{slug}/roster`).

Player rows include per-game **PTS/REB/AST/FG%**, **GP**, **MIN** (as `mpg`), **season**, and **team** as full name. **Height / weight / jersey** are placeholders (`—`, `0`) unless you extend the script (e.g. `commonplayerinfo` per player). **Position** is filled when the NBA response includes it; otherwise `—`.

## Reference: prerequisites (summary)

1. **Supabase service role key** — `SUPABASE_SERVICE_ROLE_KEY` in `.env` or `.env.local` (non-empty). Never `VITE_`.
2. **Project URL** — `SUPABASE_URL` or `VITE_SUPABASE_URL`.
3. **Env merge** — `.env` then `.env.local`; only non-empty `.env.local` values override.
4. **Tables** — `nba_standings` from the migration above; `player_stats` optional with `--players` and correct constraints.
5. **RLS** — Service role bypasses RLS for writes.

## Legal / ops

- `nba_api` is third-party; **NBA.com [Terms of Use](https://www.nba.com/termsofuse)** apply to traffic you generate.  
- Prefer **low frequency** (e.g. daily cron), caching in Supabase, and avoiding redundant calls during development.

## See also

- [`docs/LIVE_STANDINGS.md`](./LIVE_STANDINGS.md) — table shape and UI fallback behavior.

# StaxNYC Predictor

NBA player performance analytics platform — React + Vite + Supabase.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Supabase credentials
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```
Then open `.env` and set:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```
Get these from your Supabase dashboard → Settings → API.

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

---

## Pages
| Route | Page |
|---|---|
| `/` | Home — search + featured players |
| `/player/:id` | Player profile + stats |
| `/live-games` | Today's games (polls every 10s) |
| `/standings` | Conference standings |
| `/compare` | Side-by-side radar chart |
| `/highlights` | Game highlights (YouTube) |
| `/login` | Login |
| `/signup` | Sign up |
| `/profile` | User profile |
| `/admin` | Admin panel (admin role required) |

## Tech Stack
- React 18 + Vite 5
- React Router v6
- Supabase (auth + PostgreSQL)
- Vanilla CSS (no Tailwind)

## Supabase Tables Required
- `player_stats`
- `player_games`
- `game_highlights`
- `live_games`
- `featured_players`
- `user_profiles`
- `profile_change_requests`

## StaxNYC revamp

The homepage now includes **My Stack**, a browser-saved player watchlist, team filters, stat sorting, keyboard search, and a refreshed responsive design. Secondary pages load on demand.

Run `npm test` for stack/filter tests and `npm run test:browser` for browser flows (Google Chrome required). Browser tests use synthetic fixtures, not production data. See [the revamp notes](docs/REVAMP.md) for repository provenance, setup, and verification limits.

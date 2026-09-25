# StaxNYC revamp

StaxNYC is a basketball research dashboard: explore player performance, compare matchups, and build a personal player stack.

## Repository review

| Repository | Reviewed revision | Role |
| --- | --- | --- |
| `Sushanta451/csc47300-s2026-team-staxnyc-components` | `9c9aadd` | Implementation base: most complete React/Vite app, auth, profiles, rosters, live games, comparisons and server-side AI routes. |
| `zihadpcode/csc473-s2026-staxnyc-components` | `85ad787` | Earlier personal component implementation. Its feature areas already exist in the newer team app. |
| `Sushanta451/csc47300-s2026-team-staxnyc` | `4da56aa` | Original HTML/TypeScript prototype and local player assets. Its static player IDs/data do not match the newer database contract and were not substituted for live records. |

All three repositories were downloaded for comparison. The newer component app is retained rather than overwriting it with older files. The original README describes a Flask/ML backend, but that backend is not present in the original checkout. The newer repository explicitly excludes its separately managed Azure backend and SQL. This change does not reconstruct or claim to verify those services.

## What changed

- New court-inspired homepage, restrained orange/green palette, responsive player cards and clear navigation to existing tools.
- My Stack: save/remove up to 50 featured players without an account. Identity is saved in this browser, not synced to an account. Stats come from the connected feed, never a saved historical number.
- Team filters and sorting by points, rebounds, assists or name.
- Keyboard player search with debounce, request ordering, error handling and accessible result selection.
- Distinct loading, empty and unavailable states; the home feed times out after 12 seconds and allows retry.
- Mobile menu responds to viewport changes and closes on Escape/navigation.
- Focus indicators, skip navigation, reduced-motion support and a not-found route.
- Lazy-loaded secondary routes to reduce initial JavaScript; dependency lockfile for reproducible installs.

## Run and verify

1. `npm ci`
2. Copy `.env.example` to `.env` and supply this project's public Supabase URL and public anonymous key. Never use a service-role key in a browser variable.
3. `npm run dev`
4. `npm test`
5. `npm run test:browser` (requires Google Chrome; tests start their own local server on port 4174)
6. `npm run build`

Browser tests intercept the database requests with **synthetic test players**. They do not query or modify production data. They cover persistence, removal, filters, sorting, keyboard search, out-of-order requests, mobile menu behavior, and failed-feed recovery.

Without local configuration, development shows a preview notice and an unavailable feed. The existing production configuration requirement remains in place. Live data freshness, production auth, AI responses, chat, and prediction accuracy require integration testing with the real configured services before release.

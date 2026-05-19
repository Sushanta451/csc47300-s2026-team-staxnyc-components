-- Team logo URLs (CDN); populated by scripts/upsert_team_logos.mjs or left null for client fallback.
alter table nba_standings
  add column if not exists logo_url text;

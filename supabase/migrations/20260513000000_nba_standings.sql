-- Live standings for the app (`getStandings` in src/lib/api.js).
-- Populate via scheduled job / manual SQL / script output — see docs/LIVE_STANDINGS.md

create table if not exists public.nba_standings (
  id bigint generated always as identity primary key,
  conference text not null check (conference in ('East', 'West')),
  team text not null,
  rank int not null,
  wins int not null,
  losses int not null,
  pct double precision not null,
  gb double precision not null default 0,
  streak text,
  last10 text,
  team_slug text,
  updated_at timestamptz not null default now(),
  unique (conference, team)
);

create index if not exists nba_standings_conf_rank_idx
  on public.nba_standings (conference, rank);

alter table public.nba_standings enable row level security;

create policy "nba_standings_select_anon"
  on public.nba_standings for select
  using (true);

comment on table public.nba_standings is 'Conference standings rows; app falls back to static data when empty.';

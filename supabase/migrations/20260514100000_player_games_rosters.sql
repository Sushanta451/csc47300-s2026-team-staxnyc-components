-- NBA API sync: team_id on standings, per-game logs, official rosters, optional profile columns on player_stats.

alter table public.nba_standings
  add column if not exists team_id bigint;

comment on column public.nba_standings.team_id is 'NBA stats API franchise id (e.g. 1610612747); used for roster pages.';

-- Per-player game log rows (from nba_api playergamelog).
create table if not exists public.player_games (
  id bigint generated always as identity primary key,
  player_id text not null,
  game_id text not null,
  season text not null,
  game_date date not null,
  matchup text,
  opponent text,
  wl text,
  min numeric,
  pts int not null default 0,
  reb int not null default 0,
  ast int not null default 0,
  fgm int,
  fga int,
  fg3m int,
  fg3a int,
  ftm int,
  fta int,
  updated_at timestamptz not null default now(),
  unique (player_id, game_id)
);

create index if not exists player_games_player_date_idx
  on public.player_games (player_id, game_date desc);

alter table public.player_games enable row level security;

drop policy if exists "player_games_select_anon" on public.player_games;
create policy "player_games_select_anon"
  on public.player_games for select
  using (true);

comment on table public.player_games is 'Recent games per player; filled by scripts/sync_nba_to_supabase.py --games.';

-- Official team rosters from nba_api commonteamroster.
create table if not exists public.nba_team_rosters (
  id bigint generated always as identity primary key,
  season text not null,
  team_id bigint not null,
  team_name text not null,
  player_id text not null,
  player_name text not null,
  jersey_number text,
  position text,
  height text,
  weight text,
  birth_date text,
  school text,
  updated_at timestamptz not null default now(),
  unique (season, team_id, player_id)
);

create index if not exists nba_team_rosters_team_season_idx
  on public.nba_team_rosters (team_id, season);

alter table public.nba_team_rosters enable row level security;

drop policy if exists "nba_team_rosters_select_anon" on public.nba_team_rosters;
create policy "nba_team_rosters_select_anon"
  on public.nba_team_rosters for select
  using (true);

comment on table public.nba_team_rosters is 'Roster rows from NBA CommonTeamRoster; filled with --players.';

-- Optional profile fields (enriched from roster + optional CommonPlayerInfo in sync).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'player_stats'
  ) then
    alter table public.player_stats add column if not exists birth_date text;
    alter table public.player_stats add column if not exists school text;
    alter table public.player_stats add column if not exists country text;
    alter table public.player_stats add column if not exists draft_year text;
    alter table public.player_stats add column if not exists draft_round text;
    alter table public.player_stats add column if not exists draft_number text;
  end if;
end $$;

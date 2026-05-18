#!/usr/bin/env python3
"""
Sync NBA.com stats into Supabase using the swar/nba_api client.

  - Default: standings -> public.nba_standings (upsert on conference, team)
  - With --players: LeagueDashPlayerStats -> public.player_stats; CommonTeamRoster -> nba_team_rosters;
    roster fields merged into player_stats (height, weight, jersey, birth_date, school).
  - With --games: PlayerGameLog -> public.player_games (uses player_ids from player_stats in Supabase).
  - With --enrich: CommonPlayerInfo patches country + draft fields (rate-limited; see --enrich-limit).

Requires SUPABASE_SERVICE_ROLE_KEY (never expose in Vite). URL from SUPABASE_URL or VITE_SUPABASE_URL.

  npm run sync:nba
  npm run sync:nba -- --players
  npm run sync:nba -- --players --games
  npm run sync:nba -- --players --enrich

See docs/NBA_API_SYNC.md
"""
from __future__ import annotations

import argparse
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]


def _strip_val(v) -> str | None:
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def load_project_env() -> None:
    """
    Load .env then .env.local. Only non-empty values from .env.local override .env
    (so an empty line in .env.local cannot wipe SUPABASE_SERVICE_ROLE_KEY from .env).
    """
    base = dotenv_values(ROOT / ".env") or {}
    local = dotenv_values(ROOT / ".env.local") or {}
    merged: dict[str, str] = {}
    for k, v in base.items():
        s = _strip_val(v)
        if s is not None:
            merged[k] = s
    for k, v in local.items():
        s = _strip_val(v)
        if s is not None:
            merged[k] = s
    for k, v in merged.items():
        os.environ[k] = v


load_project_env()


def team_name_to_slug(name: str) -> str:
    s = (name or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"^-+|-+$", "", s)


def default_nba_season(now: datetime | None = None) -> str:
    d = now or datetime.now(timezone.utc)
    y, m = d.year, d.month
    start = y if m >= 10 else y - 1
    return f"{start}-{str(start + 1)[2:]}"


def conference_label(raw: str) -> str | None:
    if not raw:
        return None
    u = str(raw).strip().upper()
    if u.startswith("E"):
        return "East"
    if u.startswith("W"):
        return "West"
    return None


def _parse_gb(val) -> float:
    if val is None or val == "" or str(val).strip() in ("—", "-", "None"):
        return 0.0
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0


def parse_standings_rows(result_set: dict) -> list[dict]:
    headers = result_set.get("headers") or []
    by_conf: dict[str, list[dict]] = {"East": [], "West": []}

    for row in result_set.get("rowSet") or []:
        rec = dict(zip(headers, row))
        conf = conference_label(rec.get("Conference"))
        if not conf:
            continue
        by_conf[conf].append(rec)

    rows_out: list[dict] = []
    for conf, items in by_conf.items():
        items.sort(
            key=lambda r: (-float(r.get("WinPCT") or 0), -int(r.get("WINS") or 0), int(r.get("LOSSES") or 99)),
        )
        for rank, rec in enumerate(items, start=1):
            city = (rec.get("TeamCity") or "").strip()
            nick = (rec.get("TeamName") or "").strip()
            built = f"{city} {nick}".strip()
            rows_out.append(
                {
                    "conference": conf,
                    "team": built,
                    "team_id": rec.get("TeamID"),
                    "rank": rank,
                    "wins": int(rec.get("WINS") or 0),
                    "losses": int(rec.get("LOSSES") or 0),
                    "pct": float(rec.get("WinPCT") or 0),
                    "gb": _parse_gb(rec.get("ConferenceGamesBack")),
                    "streak": str(rec.get("strCurrentStreak") or "—"),
                    "last10": str(rec.get("L10") or "—"),
                }
            )
    return rows_out


def apply_full_team_names(rows: list[dict], id_to_full: dict[int, str]) -> None:
    for r in rows:
        tid = r.get("team_id")
        try:
            tid_int = int(tid) if tid is not None else None
        except (TypeError, ValueError):
            tid_int = None
        if tid_int is not None and tid_int in id_to_full:
            r["team"] = id_to_full[tid_int]
        r["team_slug"] = team_name_to_slug(r["team"])


def fetch_standings_payload(season: str) -> list[dict]:
    from nba_api.stats.endpoints import leaguestandingsv3
    from nba_api.stats.static import teams as teams_static

    id_to_full = {int(t["id"]): t["full_name"] for t in teams_static.get_teams()}

    obj = leaguestandingsv3.LeagueStandingsV3(
        league_id="00",
        season=season,
        season_type="Regular Season",
        timeout=60,
    )
    d = obj.get_dict()
    result_sets = d.get("resultSets") or []
    standings_rs = next((rs for rs in result_sets if rs.get("name") == "Standings"), None)
    if not standings_rs:
        raise RuntimeError("nba_api: no 'Standings' result set in leaguestandingsv3 response")

    rows = parse_standings_rows(standings_rs)
    apply_full_team_names(rows, id_to_full)
    return [
        {
            "conference": r["conference"],
            "team": r["team"],
            "team_id": int(r["team_id"]) if r.get("team_id") is not None else None,
            "rank": r["rank"],
            "wins": r["wins"],
            "losses": r["losses"],
            "pct": r["pct"],
            "gb": r["gb"],
            "streak": r["streak"],
            "last10": r["last10"],
            "team_slug": r["team_slug"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        for r in rows
    ]


def parse_nba_game_date(raw) -> str | None:
    if not raw:
        return None
    s = str(raw).strip()
    for fmt in ("%b %d, %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(s, fmt).date().isoformat()
        except ValueError:
            continue
    return None


def matchup_opponent(matchup: str) -> str:
    m = (matchup or "").strip()
    if " vs. " in m:
        return m.split(" vs. ")[-1].strip()
    if " @ " in m:
        return "@" + m.split(" @ ")[-1].strip()
    return m or "—"


def parse_jersey_int(raw) -> int:
    s = str(raw or "").strip()
    if not s or not s.isdigit():
        return 0
    return int(s)


def parse_weight_int(raw) -> int:
    try:
        return int(float(str(raw).strip()))
    except (TypeError, ValueError):
        return 0


def fetch_team_rosters_payload(season: str, pause: float = 0.45) -> tuple[list[dict], dict[str, dict]]:
    """CommonTeamRoster for all NBA teams -> rows for nba_team_rosters + meta keyed by player_id for player_stats merge."""
    from nba_api.stats.endpoints import commonteamroster
    from nba_api.stats.static import teams as teams_static

    table_rows: list[dict] = []
    meta: dict[str, dict] = {}
    teams_list = teams_static.get_teams()
    now_iso = datetime.now(timezone.utc).isoformat()
    for idx, t in enumerate(teams_list):
        tid = int(t["id"])
        full = t["full_name"]
        if pause > 0 and idx:
            time.sleep(pause)
        obj = commonteamroster.CommonTeamRoster(team_id=tid, season=season, timeout=90)
        d = obj.get_dict()
        rs = next((x for x in (d.get("resultSets") or []) if x.get("name") == "CommonTeamRoster"), None)
        if not rs:
            continue
        headers = rs.get("headers") or []
        for row in rs.get("rowSet") or []:
            rec = dict(zip(headers, row))
            pid = rec.get("PLAYER_ID")
            if pid is None:
                continue
            pid_s = str(int(pid))
            jersey = str(rec.get("NUM") or "").strip()
            height = str(rec.get("HEIGHT") or "").strip() or "—"
            w_raw = rec.get("WEIGHT")
            weight_lbs = parse_weight_int(w_raw)
            birth = str(rec.get("BIRTH_DATE") or "").strip() or None
            school = str(rec.get("SCHOOL") or "").strip() or None
            pos = str(rec.get("POSITION") or "").strip() or "—"
            name = str(rec.get("PLAYER") or "").strip()
            w_str = str(w_raw).strip() if w_raw is not None else None
            table_rows.append(
                {
                    "season": season,
                    "team_id": tid,
                    "team_name": full,
                    "player_id": pid_s,
                    "player_name": name,
                    "jersey_number": jersey or None,
                    "position": pos,
                    "height": height,
                    "weight": w_str,
                    "birth_date": birth,
                    "school": school,
                    "updated_at": now_iso,
                },
            )
            meta[pid_s] = {
                "height": height,
                "weight": weight_lbs,
                "jersey_number": parse_jersey_int(jersey),
                "birth_date": birth,
                "school": school,
            }
    print(f"Fetched {len(table_rows)} roster slots across {len(teams_list)} teams.")
    return table_rows, meta


def fetch_player_stats_rows(season: str, roster_meta: dict[str, dict] | None = None) -> list[dict]:
    from nba_api.stats.endpoints import leaguedashplayerstats
    from nba_api.stats.static import teams as teams_static

    abbr_to_full = {t["abbreviation"]: t["full_name"] for t in teams_static.get_teams()}

    obj = leaguedashplayerstats.LeagueDashPlayerStats(
        league_id_nullable="00",
        season=season,
        season_type_all_star="Regular Season",
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Base",
        timeout=90,
    )
    d = obj.get_dict()
    rs = next((x for x in (d.get("resultSets") or []) if x.get("name") == "LeagueDashPlayerStats"), None)
    if not rs:
        raise RuntimeError("nba_api: no LeagueDashPlayerStats result set")

    headers = rs.get("headers") or []
    out: list[dict] = []
    for row in rs.get("rowSet") or []:
        rec = dict(zip(headers, row))
        pid = rec.get("PLAYER_ID")
        if pid is None:
            continue
        pid_s = str(int(pid))
        abbr = (rec.get("TEAM_ABBREVIATION") or "").strip().upper()
        team_full = abbr_to_full.get(abbr) or abbr
        fg = rec.get("FG_PCT")
        try:
            fg_f = float(fg) if fg is not None else 0.0
        except (TypeError, ValueError):
            fg_f = 0.0
        fg_pct = round(fg_f * 100, 1) if fg_f and fg_f <= 1.0 else round(fg_f, 1)

        def fnum(x, default=0.0):
            try:
                return float(x)
            except (TypeError, ValueError):
                return default

        def inum(x, default=0):
            try:
                return int(float(x))
            except (TypeError, ValueError):
                return default

        pos = rec.get("POSITION") or rec.get("PLAYER_POSITION") or "—"
        extra = (roster_meta or {}).get(pid_s, {})
        height = extra.get("height") or "—"
        weight = extra.get("weight", 0)
        jersey_number = extra.get("jersey_number", 0)
        birth_date = extra.get("birth_date")
        school = extra.get("school")
        row_out: dict = {
            "player_id": pid_s,
            "player_name": (rec.get("PLAYER_NAME") or "").strip(),
            "team": team_full,
            "position": pos if str(pos).strip() else "—",
            "height": height,
            "weight": weight,
            "jersey_number": jersey_number,
            "ppg": round(fnum(rec.get("PTS")), 1),
            "rpg": round(fnum(rec.get("REB")), 1),
            "apg": round(fnum(rec.get("AST")), 1),
            "fg_pct": fg_pct,
            "season": season,
            "games_played": inum(rec.get("GP")),
            "mpg": round(fnum(rec.get("MIN")), 1),
        }
        if birth_date:
            row_out["birth_date"] = birth_date
        if school:
            row_out["school"] = school
        out.append(row_out)
    return out


def fetch_player_game_log_rows(player_id: str, season: str, limit: int) -> list[dict]:
    from nba_api.stats.endpoints import playergamelog

    obj = playergamelog.PlayerGameLog(
        player_id=player_id,
        season=season,
        season_type_all_star="Regular Season",
        timeout=75,
    )
    d = obj.get_dict()
    rs = next((x for x in (d.get("resultSets") or []) if x.get("name") == "PlayerGameLog"), None)
    if not rs:
        return []
    headers = rs.get("headers") or []
    now_iso = datetime.now(timezone.utc).isoformat()
    out: list[dict] = []
    for row in (rs.get("rowSet") or [])[:limit]:
        rec = dict(zip(headers, row))
        gd = parse_nba_game_date(rec.get("GAME_DATE"))
        if not gd:
            continue
        gid = rec.get("Game_ID")
        matchup = str(rec.get("MATCHUP") or "")

        def ig(x, default=0):
            try:
                return int(float(x))
            except (TypeError, ValueError):
                return default

        def fg(x):
            try:
                return float(x)
            except (TypeError, ValueError):
                return None

        out.append(
            {
                "player_id": str(int(rec.get("Player_ID") or rec.get("PLAYER_ID") or player_id)),
                "game_id": str(gid or ""),
                "season": season,
                "game_date": gd,
                "matchup": matchup,
                "opponent": matchup_opponent(matchup),
                "wl": str(rec.get("WL") or "").strip() or None,
                "min": fg(rec.get("MIN")),
                "pts": ig(rec.get("PTS")),
                "reb": ig(rec.get("REB")),
                "ast": ig(rec.get("AST")),
                "fgm": ig(rec.get("FGM")),
                "fga": ig(rec.get("FGA")),
                "fg3m": ig(rec.get("FG3M")),
                "fg3a": ig(rec.get("FG3A")),
                "ftm": ig(rec.get("FTM")),
                "fta": ig(rec.get("FTA")),
                "updated_at": now_iso,
            },
        )
    return out


def supabase_client():
    from supabase import create_client

    url = _strip_val(os.environ.get("SUPABASE_URL")) or _strip_val(os.environ.get("VITE_SUPABASE_URL"))
    key = _strip_val(os.environ.get("SUPABASE_SERVICE_ROLE_KEY")) or _strip_val(
        os.environ.get("SUPABASE_SERVICE_KEY"),
    )

    if not url or not key:
        env_path = ROOT / ".env"
        local_path = ROOT / ".env.local"
        print("Supabase credentials missing after loading:", file=sys.stderr)
        print(f"  - {env_path} {'(exists)' if env_path.exists() else '(missing)'}", file=sys.stderr)
        print(f"  - {local_path} {'(exists)' if local_path.exists() else '(missing)'}", file=sys.stderr)
        print(
            "  Non-empty .env.local values override .env; empty keys in .env.local no longer wipe .env.",
            file=sys.stderr,
        )
        if not url:
            print(
                "  Missing URL: set SUPABASE_URL or VITE_SUPABASE_URL (https://….supabase.co).",
                file=sys.stderr,
            )
        if not key:
            print(
                "  Missing key: set SUPABASE_SERVICE_ROLE_KEY (service_role JWT from Supabase dashboard).",
                file=sys.stderr,
            )
            print(
                "  Do not use VITE_ for the service role key. Anon key (VITE_SUPABASE_KEY) cannot upsert.",
                file=sys.stderr,
            )
        sys.exit(1)
    return create_client(url, key)


def upsert_standings(client, rows: list[dict]) -> None:
    if not rows:
        print("No standings rows.")
        return
    client.table("nba_standings").upsert(rows, on_conflict="conference,team").execute()
    print(f"Upserted {len(rows)} rows into nba_standings.")


def upsert_players(client, rows: list[dict], chunk: int = 80) -> None:
    if not rows:
        print("No player rows.")
        return
    for i in range(0, len(rows), chunk):
        batch = rows[i : i + chunk]
        client.table("player_stats").upsert(batch, on_conflict="player_id").execute()
        print(f"Upserted player_stats {i + 1}-{i + len(batch)} / {len(rows)}")
    print(f"Done. Total players: {len(rows)}")


def upsert_team_rosters(client, rows: list[dict], chunk: int = 120) -> None:
    if not rows:
        print("No team roster rows.")
        return
    for i in range(0, len(rows), chunk):
        batch = rows[i : i + chunk]
        client.table("nba_team_rosters").upsert(batch, on_conflict="season,team_id,player_id").execute()
        print(f"Upserted nba_team_rosters {i + 1}-{i + len(batch)} / {len(rows)}")
    print(f"Done. Total roster rows: {len(rows)}")


def upsert_player_games(client, rows: list[dict], chunk: int = 250) -> None:
    if not rows:
        print("No player_games rows.")
        return
    for i in range(0, len(rows), chunk):
        batch = rows[i : i + chunk]
        client.table("player_games").upsert(batch, on_conflict="player_id,game_id").execute()
        print(f"Upserted player_games {i + 1}-{i + len(batch)} / {len(rows)}")
    print(f"Done. Total game rows: {len(rows)}")


def fetch_all_player_ids(client) -> list[str]:
    out: list[str] = []
    page = 0
    page_size = 1000
    while True:
        res = (
            client.table("player_stats")
            .select("player_id")
            .order("player_id")
            .range(page * page_size, (page + 1) * page_size - 1)
            .execute()
        )
        data = res.data or []
        for r in data:
            pid = r.get("player_id")
            if pid is not None:
                out.append(str(pid))
        if len(data) < page_size:
            break
        page += 1
    return out


def sync_all_player_games(
    client,
    season: str,
    per_player: int,
    max_players: int | None,
    pause: float,
) -> None:
    ids = fetch_all_player_ids(client)
    if max_players is not None:
        ids = ids[:max_players]
    print(f"Syncing player_games for {len(ids)} players (last {per_player} games each)...")
    all_rows: list[dict] = []
    for i, pid in enumerate(ids):
        if pause > 0 and i:
            time.sleep(pause)
        try:
            all_rows.extend(fetch_player_game_log_rows(pid, season, per_player))
        except Exception as e:
            print(f"Warning: game log failed for {pid}: {e}", file=sys.stderr)
        if (i + 1) % 100 == 0:
            print(f"  ... {i + 1}/{len(ids)} players")
    upsert_player_games(client, all_rows)


def enrich_players_common_info(client, player_ids: list[str], pause: float) -> None:
    from nba_api.stats.endpoints import commonplayerinfo

    if not player_ids:
        print("No players to enrich.")
        return
    print(f"Enriching {len(player_ids)} players from CommonPlayerInfo...")
    for i, pid in enumerate(player_ids):
        if pause > 0 and i:
            time.sleep(pause)
        try:
            obj = commonplayerinfo.CommonPlayerInfo(player_id=pid, timeout=75)
            d = obj.get_dict()
            rs = next((x for x in (d.get("resultSets") or []) if x.get("name") == "CommonPlayerInfo"), None)
            if not rs or not rs.get("rowSet"):
                continue
            headers = rs.get("headers") or []
            rec = dict(zip(headers, rs["rowSet"][0]))
            upd = {
                "country": str(rec.get("COUNTRY") or "").strip() or None,
                "draft_year": str(rec.get("DRAFT_YEAR") or "").strip() or None,
                "draft_round": str(rec.get("DRAFT_ROUND") or "").strip() or None,
                "draft_number": str(rec.get("DRAFT_NUMBER") or "").strip() or None,
            }
            upd = {k: v for k, v in upd.items() if v}
            if not upd:
                continue
            client.table("player_stats").update(upd).eq("player_id", pid).execute()
        except Exception as e:
            print(f"Warning: enrich failed for {pid}: {e}", file=sys.stderr)
        if (i + 1) % 25 == 0:
            print(f"  ... enriched {i + 1}/{len(player_ids)}")
    print("Enrichment pass complete.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--season", default=os.environ.get("NBA_SEASON") or default_nba_season())
    parser.add_argument("--players", action="store_true", help="Upsert player_stats + nba_team_rosters (LeagueDash + CommonTeamRoster)")
    parser.add_argument(
        "--skip-standings",
        action="store_true",
        help="Skip nba_standings (use with --players, --games, and/or --enrich)",
    )
    parser.add_argument(
        "--games",
        action="store_true",
        help="Upsert player_games from PlayerGameLog (player_ids from player_stats in Supabase)",
    )
    parser.add_argument("--games-per-player", type=int, default=12, help="Recent games per player for --games")
    parser.add_argument(
        "--games-max-players",
        type=int,
        default=None,
        help="Optional cap on players for --games (default: all rows in player_stats)",
    )
    parser.add_argument(
        "--game-log-pause",
        type=float,
        default=0.35,
        help="Seconds between PlayerGameLog requests (politeness to stats.nba.com)",
    )
    parser.add_argument(
        "--enrich",
        action="store_true",
        help="Patch player_stats from CommonPlayerInfo (country, draft fields)",
    )
    parser.add_argument("--enrich-limit", type=int, default=50, help="Max players for --enrich when not combined with full --players list")
    parser.add_argument(
        "--enrich-pause",
        type=float,
        default=0.4,
        help="Seconds between CommonPlayerInfo requests",
    )
    parser.add_argument(
        "--roster-pause",
        type=float,
        default=0.45,
        help="Seconds between CommonTeamRoster team requests",
    )
    args = parser.parse_args()
    season = args.season.strip()
    client = supabase_client()

    if args.skip_standings and not (args.players or args.games or args.enrich):
        parser.error("--skip-standings requires at least one of --players, --games, or --enrich")

    if not args.skip_standings:
        upsert_standings(client, fetch_standings_payload(season))

    if args.players:
        roster_rows, roster_meta = fetch_team_rosters_payload(season, pause=args.roster_pause)
        upsert_team_rosters(client, roster_rows)
        players = fetch_player_stats_rows(season, roster_meta)
        upsert_players(client, players)
        if args.enrich:
            lim = min(args.enrich_limit, len(players))
            enrich_players_common_info(client, [p["player_id"] for p in players[:lim]], args.enrich_pause)
    elif args.enrich:
        ids = fetch_all_player_ids(client)[: args.enrich_limit]
        enrich_players_common_info(client, ids, args.enrich_pause)

    if args.games:
        sync_all_player_games(
            client,
            season,
            args.games_per_player,
            args.games_max_players,
            args.game_log_pause,
        )


if __name__ == "__main__":
    main()

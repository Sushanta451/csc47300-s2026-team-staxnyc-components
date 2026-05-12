#!/usr/bin/env python3
"""
Sync NBA.com stats into Supabase using the swar/nba_api client.

  - Default: standings -> public.nba_standings (upsert on conference, team)
  - With --players: also LeagueDashPlayerStats -> public.player_stats (upsert on player_id)

Requires SUPABASE_SERVICE_ROLE_KEY (never expose in Vite). URL from SUPABASE_URL or VITE_SUPABASE_URL.

  npm run sync:nba
  npm run sync:nba -- --players

See docs/NBA_API_SYNC.md
"""
from __future__ import annotations

import argparse
import os
import re
import sys
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
        r.pop("team_id", None)


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


def fetch_player_stats_rows(season: str) -> list[dict]:
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
        out.append(
            {
                "player_id": str(int(pid)),
                "player_name": (rec.get("PLAYER_NAME") or "").strip(),
                "team": team_full,
                "position": pos if str(pos).strip() else "—",
                "height": "—",
                "weight": 0,
                "jersey_number": 0,
                "ppg": round(fnum(rec.get("PTS")), 1),
                "rpg": round(fnum(rec.get("REB")), 1),
                "apg": round(fnum(rec.get("AST")), 1),
                "fg_pct": fg_pct,
                "season": season,
                "games_played": inum(rec.get("GP")),
                "mpg": round(fnum(rec.get("MIN")), 1),
            }
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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--season", default=os.environ.get("NBA_SEASON") or default_nba_season())
    parser.add_argument("--players", action="store_true", help="Also upsert player_stats from LeagueDashPlayerStats")
    parser.add_argument(
        "--skip-standings",
        action="store_true",
        help="Only run player sync (requires --players)",
    )
    args = parser.parse_args()
    season = args.season.strip()
    client = supabase_client()

    if args.skip_standings and not args.players:
        parser.error("--skip-standings requires --players")

    if not args.skip_standings:
        upsert_standings(client, fetch_standings_payload(season))
    if args.players:
        upsert_players(client, fetch_player_stats_rows(season))


if __name__ == "__main__":
    main()

#!/usr/bin/env bash
# Run from repo root: creates scripts/.venv-nba if needed, installs deps, runs NBA.com -> Supabase sync.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ ! -x scripts/.venv-nba/bin/python ]]; then
  python3 -m venv scripts/.venv-nba
fi
scripts/.venv-nba/bin/pip install -q -r scripts/requirements-nba.txt
exec scripts/.venv-nba/bin/python scripts/sync_nba_to_supabase.py "$@"

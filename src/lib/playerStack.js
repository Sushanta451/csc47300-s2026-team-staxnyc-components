export const STACK_KEY = "staxnyc.player-stack.v1";

export function readStack(storage) {
  try {
    const rows = JSON.parse(storage.getItem(STACK_KEY) || "[]");
    if (!Array.isArray(rows)) return [];
    const seen = new Set();
    return rows
      .filter((p) => {
        if (
          !p ||
          !["string", "number"].includes(typeof p.player_id) ||
          !p.player_name
        )
          return false;
        const id = String(p.player_id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .slice(0, 50);
  } catch {
    return [];
  }
}

export function toggleStack(players, player) {
  const id = String(player.player_id);
  return players.some((p) => String(p.player_id) === id)
    ? players.filter((p) => String(p.player_id) !== id)
    : [
        ...players,
        {
          player_id: id,
          player_name: player.player_name || player.name,
          team: player.team,
          position: player.position,
        },
      ].slice(0, 50);
}

export function selectPlayers(
  players,
  { team = "all", sort = "featured" } = {},
) {
  const filtered = players.filter((p) => team === "all" || p.team === team);
  if (sort === "name")
    return filtered.sort((a, b) => a.player_name.localeCompare(b.player_name));
  if (["ppg", "rpg", "apg"].includes(sort)) {
    const value = (p) =>
      p[sort] == null || p[sort] === "" || !Number.isFinite(Number(p[sort]))
        ? -Infinity
        : Number(p[sort]);
    return filtered.sort((a, b) => value(b) - value(a));
  }
  return filtered;
}

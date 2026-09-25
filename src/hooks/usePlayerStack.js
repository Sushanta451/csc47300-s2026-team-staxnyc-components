import { useEffect, useState } from "react";
import { readStack, STACK_KEY, toggleStack } from "../lib/playerStack";

export default function usePlayerStack() {
  const [players, setPlayers] = useState(() => {
    try {
      return readStack(window.localStorage);
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  useEffect(() => {
    function sync(e) {
      if (e.key === STACK_KEY || e.key === null) {
        try {
          setPlayers(readStack(window.localStorage));
        } catch {
          /* Storage may be blocked. */
        }
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function toggle(player) {
    const exists = players.some(
      (p) => String(p.player_id) === String(player.player_id),
    );
    if (!exists && players.length >= 50) {
      setNotice("Your stack is full. Remove a player before adding another.");
      return;
    }
    const next = toggleStack(players, player);
    setPlayers(next);
    try {
      window.localStorage.setItem(STACK_KEY, JSON.stringify(next));
      setNotice(
        `${player.player_name || player.name} ${exists ? "removed from" : "added to"} your stack.`,
      );
    } catch {
      setNotice(
        "Saved for this visit. Your browser could not save the stack for next time.",
      );
    }
  }
  return { players, toggle, notice };
}

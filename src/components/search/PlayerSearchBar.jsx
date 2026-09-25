import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPlayers } from "../../lib/api";
import { isSupabaseConfigured } from "../../lib/supabase";
import { formatPlayerMeta } from "../../lib/playerPosition";
import { formatTeamLabel } from "../../lib/teamBranding";

export default function PlayerSearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = ++requestId.current;
    setSuggestions([]);
    setActive(-1);
    if (!query.trim()) {
      setLoading(false);
      setMessage("");
      return;
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      setMessage("Player search is temporarily unavailable.");
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchPlayers(query, 8);
        if (requestId.current !== id) return;
        setSuggestions(data || []);
        setMessage(data?.length ? "" : "No players found. Try another name.");
      } catch {
        if (requestId.current === id)
          setMessage("Search couldn’t connect. Edit your search to try again.");
      } finally {
        if (requestId.current === id) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      requestId.current++;
    };
  }, [query]);

  function choose(player) {
    setOpen(false);
    navigate("/player/" + player.player_id);
  }
  function onKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
    if (suggestions.length && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      setActive((i) =>
        e.key === "ArrowDown"
          ? (i + 1) % suggestions.length
          : i <= 0
            ? suggestions.length - 1
            : i - 1,
      );
    }
  }
  return (
    <form
      className="search"
      ref={formRef}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && open && suggestions.length)
          choose(suggestions[Math.max(0, active)]);
      }}
    >
      <div className="search-box">
        <input
          className="search-input"
          aria-label="Search NBA players"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="player-suggestions"
          aria-activedescendant={
            open && active >= 0 ? `player-option-${active}` : undefined
          }
          placeholder="Search a player. Find your edge."
          autoComplete="off"
          value={query}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            requestId.current++;
            setSuggestions([]);
            setQuery(e.target.value);
            setMessage("");
            setOpen(true);
          }}
        />
        <button
          className="search-btn"
          type="submit"
          disabled={loading || !query.trim()}
        >
          Search ↗
        </button>
      </div>
      {open && suggestions.length > 0 && (
        <div className="suggestions" id="player-suggestions" role="listbox">
          {suggestions.map((p, i) => (
            <div
              id={`player-option-${i}`}
              role="option"
              aria-selected={active === i}
              key={p.player_id}
              className={`suggestion-item ${active === i ? "is-selected" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(p)}
            >
              {p.player_name}
              <span className="search-result-meta">
                {formatPlayerMeta(formatTeamLabel(p.team), p.position)}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="search-hint" role="status">
        {loading
          ? "Searching players…"
          : message || "Search by name · Use ↑ ↓ to explore and Enter to open"}
      </p>
    </form>
  );
}

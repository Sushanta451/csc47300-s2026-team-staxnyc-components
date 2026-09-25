import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlayerSearchBar from "../components/search/PlayerSearchBar";
import FeaturedPlayerCard from "../components/home/FeaturedPlayerCard";
import { getActiveFeaturedPlayers } from "../lib/api";
import { isSupabaseConfigured } from "../lib/supabase";
import { currentNbaSeasonSlug } from "../lib/nbaSeason";
import { selectPlayers } from "../lib/playerStack";
import usePlayerStack from "../hooks/usePlayerStack";
import "./HomePage.css";

const tools = [
  {
    number: "01",
    title: "Head to head",
    text: "Put players side by side. Find the difference behind the numbers.",
    href: "/compare",
    label: "Compare players",
    symbol: "⇄",
  },
  {
    number: "02",
    title: "Around the league",
    text: "Follow the scoreboard and the matchups that matter to you.",
    href: "/live-games",
    label: "Open scoreboard",
    symbol: "◉",
  },
  {
    number: "03",
    title: "The bigger picture",
    text: "Conference races, team records, and the road to the top.",
    href: "/standings",
    label: "Explore standings",
    symbol: "↗",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState("featured");
  const [team, setTeam] = useState("all");
  const [sort, setSort] = useState("featured");
  const stack = usePlayerStack();

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    const timeout = setTimeout(() => {
      if (active) { setStatus("error"); active = false; }
    }, 12000);
    getActiveFeaturedPlayers()
      .then((players) => {
        if (active) {
          setFeatured(players || []);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      }).finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [attempt]);

  // Saved entries retain identity only; use fetched stats when available so cached numbers never masquerade as fresh data.
  const savedPlayers = stack.players.map(
    (p) =>
      featured.find((f) => String(f.player_id) === String(p.player_id)) || p,
  );
  const source = view === "stack" ? savedPlayers : featured;
  const teams = [...new Set(source.map((p) => p.team).filter(Boolean))].sort();
  const players = selectPlayers(source, { team, sort });
  function switchView(next) {
    setView(next);
    setTeam("all");
  }

  return (
    <main className="container stax-home">
      <section className="stax-hero" aria-labelledby="hero-title">
        <div className="stax-hero-copy">
          <p className="stax-eyebrow">
            <span className="stax-dot" /> NEW YORK ENERGY. LEAGUE-WIDE VISION.
          </p>
          <h1 id="hero-title">
            Know the game.
            <br />
            <span>Build your stack.</span>
          </h1>
          <p className="stax-intro">
            Your court-side edge. Explore player performance, break down
            matchups, and keep your favorites in one place.
          </p>
          <div className="stax-hero-actions">
            <a className="stax-primary" href="#players">
              Explore players <span aria-hidden="true">↗</span>
            </a>
            <Link className="stax-text-link" to="/compare">
              Compare the competition →
            </Link>
          </div>
          <div className="stax-hero-meta">
            <span>{currentNbaSeasonSlug()} NBA SEASON</span>
            <span>BUILT FOR THE BASKETBALL OBSESSED</span>
          </div>
        </div>
        <div className="stax-court" aria-hidden="true">
          <div className="stax-court-top">
            <span>STAX / NYC</span>
            <span>EST. 2026</span>
          </div>
          <div className="court-lines">
            <div className="court-center" />
            <div className="court-key" />
            <div className="court-arc" />
            <div className="court-hoop" />
          </div>
          <div className="stax-court-word">
            ALL
            <br />
            ABOUT
            <br />
            <em>THE GAME.</em>
          </div>
          <div className="stax-court-bottom">
            <span>40.7128° N / 74.0060° W</span>
            <span>↗</span>
          </div>
        </div>
      </section>

      <section className="stax-search-panel" aria-label="Find a player">
        <div>
          <p className="stax-eyebrow">THE SCOUTING DESK</p>
          <h2>Who’s on your radar?</h2>
        </div>
        <PlayerSearchBar />
      </section>

      <section
        id="players"
        className="stax-players"
        aria-labelledby="players-title"
      >
        <div className="stax-section-heading">
          <div>
            <p className="stax-eyebrow">TALENT. TRENDS. YOUR PICKS.</p>
            <h2 id="players-title">
              The player board<span className="stax-orange">.</span>
            </h2>
          </div>
          <Link className="stax-text-link" to="/compare">
            Open comparison lab ↗
          </Link>
        </div>
        <div className="stax-board-controls">
          <div className="stax-segment" aria-label="Player collection">
            <button
              aria-pressed={view === "featured"}
              onClick={() => switchView("featured")}
            >
              Featured
            </button>
            <button
              aria-pressed={view === "stack"}
              onClick={() => switchView("stack")}
            >
              My Stack <span>{stack.players.length}</span>
            </button>
          </div>
          <div className="stax-filters">
            <label>
              Team
              <select aria-label="Team" value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="all">All teams</option>
                {teams.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Sort
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Default order</option>
                <option value="ppg">Points per game</option>
                <option value="rpg">Rebounds per game</option>
                <option value="apg">Assists per game</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>
        {view === "stack" && (
          <p className="stax-board-note">
            Your personal watchlist, saved in this browser. Open a profile for
            the latest available stats.
          </p>
        )}
        <p role="status" className="stax-stack-notice">
          {stack.notice}
        </p>
        {view === "featured" && status === "loading" ? (
          <div className="stax-loading" role="status">
            Loading the player board…
          </div>
        ) : view === "featured" && ["error", "unavailable"].includes(status) ? (
          <div className="stax-empty">
            <span className="stax-empty-icon" aria-hidden="true">
              ↻
            </span>
            <h3>The player feed is unavailable</h3>
            <p>
              Player data isn’t connected right now. Your saved stack is still
              here.
            </p>
            {status === "error" && (
              <button
                className="stax-primary"
                onClick={() => setAttempt((a) => a + 1)}
              >
                Try again
              </button>
            )}
            <button
              className="stax-text-link"
              onClick={() => switchView("stack")}
            >
              View My Stack →
            </button>
          </div>
        ) : players.length ? (
          <>
            <p className="stax-result-count">
              {players.length} player{players.length !== 1 ? "s" : ""} · Stats
              from the connected player feed
            </p>
            <div className="player-grid stax-player-grid">
              {players.map((player) => (
                <FeaturedPlayerCard
                  key={player.player_id}
                  player={player}
                  saved={stack.players.some(
                    (p) => String(p.player_id) === String(player.player_id),
                  )}
                  onToggleSave={() => stack.toggle(player)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="stax-empty">
            <span className="stax-empty-icon" aria-hidden="true">
              ＋
            </span>
            <h3>
              {team !== "all"
                ? "No players match this team"
                : view === "stack"
                  ? "Your next favorite starts here"
                  : "The board is warming up"}
            </h3>
            <p>
              {view === "stack"
                ? "Save players from the featured board to build your personal stack."
                : "No featured players are available yet. Try searching for a player above."}
            </p>
            {(view === "stack" || team !== "all") && (
              <button
                className="stax-primary"
                onClick={() => {
                  switchView("featured");
                  setTeam("all");
                }}
              >
                Explore featured players
              </button>
            )}
          </div>
        )}
      </section>

      <section className="stax-tools" aria-label="Explore StaxNYC">
        {tools.map((tool) => (
          <Link className="stax-tool" key={tool.href} to={tool.href}>
            <div className="stax-tool-top">
              <span>{tool.number} / THE PLAYBOOK</span>
              <span className="stax-tool-symbol" aria-hidden="true">
                {tool.symbol}
              </span>
            </div>
            <h2>{tool.title}</h2>
            <p>{tool.text}</p>
            <span className="stax-tool-link">
              {tool.label} <span aria-hidden="true">↗</span>
            </span>
          </Link>
        ))}
      </section>
      <footer className="stax-footer">
        <Link className="brand" to="/">
          STAX<span className="stax-orange">NYC</span>
        </Link>
        <p>From the city. For the game.</p>
        <Link to="/highlights">Catch the highlights ↗</Link>
      </footer>
    </main>
  );
}

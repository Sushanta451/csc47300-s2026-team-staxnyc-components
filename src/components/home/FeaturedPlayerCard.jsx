import { Link } from "react-router-dom";
import PlayerImage from "../common/PlayerImage";
import { formatPlayerMeta } from "../../lib/playerPosition";
import { formatTeamLabel, getTeamBranding } from "../../lib/teamBranding";

function stat(value) {
  return value == null || value === "" || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toFixed(1);
}

export default function FeaturedPlayerCard({ player, saved, onToggleSave }) {
  const name = player.player_name || player.name;
  const accent = getTeamBranding(player.team)?.color || "#ec7947";
  return (
    <article className="stax-player-card" style={{ "--team-color": accent }}>
      <div className="stax-player-portrait">
        <span className="stax-jersey" aria-hidden="true">
          {player.jersey_number || "NBA"}
        </span>
        <PlayerImage player={player} />
        <span className="stax-player-position">
          {player.position || "PLAYER"}
        </span>
        {onToggleSave && (
          <button
            className="stax-save"
            aria-pressed={saved}
            aria-label={`${saved ? "Remove" : "Save"} ${name}${saved ? " from" : " to"} My Stack`}
            onClick={onToggleSave}
          >
            {saved ? "✓" : "+"}
          </button>
        )}
      </div>
      <div className="stax-player-body">
        <p className="stax-eyebrow">
          {formatPlayerMeta(formatTeamLabel(player.team), null) || "NBA"}
        </p>
        <h3>
          <Link to={"/player/" + player.player_id}>{name}</Link>
        </h3>
        <dl className="stax-player-stats">
          {[
            ["PPG", player.ppg],
            ["RPG", player.rpg],
            ["APG", player.apg],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{stat(value)}</dd>
            </div>
          ))}
        </dl>
        <Link className="stax-player-link" to={"/player/" + player.player_id}>
          Player breakdown <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

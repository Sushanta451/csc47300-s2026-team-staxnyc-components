export default function HighlightCard({ highlight }) {
  return (
    <div className="card highlight-card">
      <div className="highlight-video">
        <iframe
          src={`https://www.youtube.com/embed/${highlight.youtube_video_id}`}
          title={highlight.video_title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="highlight-info">
        <h3 className="highlight-teams">{highlight.away_team} vs {highlight.home_team}</h3>
        <p className="highlight-title">{highlight.video_title}</p>
      </div>
    </div>
  )
}

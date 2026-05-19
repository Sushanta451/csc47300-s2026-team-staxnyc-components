export default function HighlightCard({ highlight, index = 0 }) {
  return (
    <div
      className="card highlight-card card-pop-in"
      style={{ '--card-pop-delay': `${Math.min(index * 0.09, 0.9)}s` }}
    >
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

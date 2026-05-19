import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase()
}

export default function ChatAuthorPopover({ profile, userId, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const displayName = profile?.display_name || 'Fan'
  const showFacts = profile && (profile.favorite_team || profile.favorite_player || profile.age)
  const profileId = profile?.id || userId

  return (
    <div
      className="chat-author-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="chat-author-card" role="dialog" aria-label="User profile card">
        <button
          type="button"
          className="modal-close chat-author-close"
          onClick={onClose}
          aria-label="Close"
        >&times;</button>

        <div className="chat-author-head">
          <div className="chat-author-avatar" aria-hidden="true">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{getInitials(displayName)}</span>}
          </div>
          <div className="chat-author-meta">
            <h3 className="chat-author-name">{displayName}</h3>
            {profile?.age && (
              <p className="chat-author-age">Age {profile.age}</p>
            )}
          </div>
        </div>

        {profile?.bio && (
          <p className="chat-author-bio">{profile.bio}</p>
        )}

        {showFacts && (
          <div className="chat-author-facts">
            {profile?.favorite_team && (
              <div className="chat-author-fact fact-red">
                <span className="chat-author-fact-label">Favorite team</span>
                <span className="chat-author-fact-value">{profile.favorite_team}</span>
              </div>
            )}
            {profile?.favorite_player && (
              <div className="chat-author-fact fact-pink">
                <span className="chat-author-fact-label">Favorite player</span>
                <span className="chat-author-fact-value">{profile.favorite_player}</span>
              </div>
            )}
          </div>
        )}

        {!profile && (
          <p className="chat-author-empty">Loading...</p>
        )}

        {profileId && (
          <Link to={`/user/${profileId}`} className="btn primary chat-author-cta" onClick={onClose}>
            View full profile
          </Link>
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import {
  getChatMessages,
  postChatMessage,
  subscribeChatMessages,
  deleteChatMessage,
  getProfilesByIds,
} from '../../lib/api'
import './LiveChatModal.css'

const MAX_LEN = 500

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase()
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function LiveChatModal({ gameId, homeTeam, awayTeam, onClose }) {
  const { user, profile, isAdmin } = useAuth()
  const [messages, setMessages] = useState([])
  const [authors, setAuthors] = useState({})
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)

  async function enrichAuthors(rows) {
    const missing = [...new Set(rows.map(m => m.user_id))].filter(id => !authors[id])
    if (!missing.length) return
    try {
      const profs = await getProfilesByIds(missing)
      setAuthors(prev => {
        const next = { ...prev }
        for (const p of profs) next[p.id] = p
        return next
      })
    } catch {
      // non-fatal — messages still render with a fallback name
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getChatMessages(gameId).then(rows => {
      if (cancelled) return
      setMessages(rows)
      enrichAuthors(rows)
    }).finally(() => { if (!cancelled) setLoading(false) })

    const channel = subscribeChatMessages(gameId, (msg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      enrichAuthors([msg])
    }, (oldRow) => {
      setMessages(prev => prev.filter(m => m.id !== oldRow.id))
    })

    return () => {
      cancelled = true
      if (channel?.unsubscribe) channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    inputRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  async function submit(e) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending || !user) return
    setSending(true)
    setError('')
    try {
      await postChatMessage(gameId, user.id, body)
      setDraft('')
    } catch (err) {
      setError(err?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  async function removeMessage(msg) {
    if (!isAdmin) return
    if (!window.confirm('Delete this message?')) return
    try {
      await deleteChatMessage(msg.id)
      setMessages(prev => prev.filter(m => m.id !== msg.id))
    } catch (err) {
      setError(err?.message || 'Delete failed')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal card panel live-chat-modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Live chat</div>
            <div className="modal-sub">{awayTeam} at {homeTeam}</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="chat-list" ref={listRef}>
          {loading && <div className="chat-empty">Loading messages...</div>}
          {!loading && messages.length === 0 && (
            <div className="chat-empty">Be the first to say something.</div>
          )}
          {!loading && messages.map(m => {
            const isMe = user && m.user_id === user.id
            const author = isMe ? profile : authors[m.user_id]
            const displayName = author?.display_name || (isMe ? 'You' : 'User')
            return (
              <div key={m.id} className={'chat-msg' + (isMe ? ' me' : '')}>
                <div className="chat-msg-avatar" aria-hidden="true">
                  {author?.avatar_url
                    ? <img src={author.avatar_url} alt="" />
                    : <span>{getInitials(displayName)}</span>}
                </div>
                <div className="chat-msg-body">
                  <div className="chat-msg-meta">
                    <span className="chat-msg-name">{displayName}</span>
                    <span className="chat-msg-time">{formatTime(m.created_at)}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        className="chat-msg-delete"
                        onClick={() => removeMessage(m)}
                        title="Delete message (admin)"
                        aria-label="Delete message"
                      >&times;</button>
                    )}
                  </div>
                  <div className="chat-msg-text">{m.body}</div>
                </div>
              </div>
            )
          })}
        </div>

        {user ? (
          <form className="chat-form" onSubmit={submit}>
            <input
              ref={inputRef}
              className="search-input chat-input"
              type="text"
              maxLength={MAX_LEN}
              placeholder={profile?.display_name ? `Message as ${profile.display_name}` : 'Say something...'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              disabled={sending}
            />
            <button type="submit" className="ask-submit" disabled={sending || !draft.trim()}>
              {sending ? '...' : 'Send'}
            </button>
          </form>
        ) : (
          <div className="chat-signin">
            <Link to="/login" className="btn primary">Sign in to chat</Link>
          </div>
        )}

        {error && <div className="ask-error chat-error">{error}</div>}
      </div>
    </div>
  )
}

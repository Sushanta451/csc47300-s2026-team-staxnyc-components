import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchPlayers } from '../../lib/api'

export default function PlayerSearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [message, setMessage] = useState('')
  const timer = useRef(null)
  const formRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const data = await searchPlayers(query, 8)
      if (data) setSuggestions(data)
    }, 300)
  }, [query])

  useEffect(() => {
    function onClick(e) {
      if (formRef.current && !formRef.current.contains(e.target)) setSuggestions([])
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (suggestions.length > 0) navigate('/player/' + suggestions[0].player_id)
    else setMessage('Player not found. Try a different name.')
  }

  return (
    <form className="search" ref={formRef} onSubmit={handleSubmit}>
      <div className="search-box">
        <span className="search-icon">🔎</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search players (e.g., LeBron James, Kyrie Irving)..."
          autoComplete="off"
          value={query}
          onChange={e => { setQuery(e.target.value); setMessage('') }}
        />
        <button className="search-btn" type="submit">Search</button>
      </div>
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map(p => (
            <div key={p.player_id} className="suggestion-item"
              onClick={() => { setSuggestions([]); setQuery(''); navigate('/player/' + p.player_id) }}>
              {p.player_name} <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>— {p.team}</span>
            </div>
          ))}
        </div>
      )}
      <p className="search-hint">Search for any player to open their profile.</p>
      {message && <p className="search-message">{message}</p>}
    </form>
  )
}

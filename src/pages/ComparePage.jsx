import { useState, useMemo } from 'react'
import RadarChart, { STAT_KEYS } from '../components/player/RadarChart'
import ComparePlayerCard, { normalizeHex } from '../components/compare/ComparePlayerCard'
import PlayerPickerModal from '../components/common/PlayerPickerModal'
import { getPlayerById, searchPlayers } from '../lib/api'
import './ComparePage.css'

export default function ComparePage() {
  const [cards, setCards] = useState([])
  const [nextSlotId, setNextSlotId] = useState(1)
  const [justAddedSlotId, setJustAddedSlotId] = useState(null)

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const [chartVisible, setChartVisible] = useState({})
  const [playerColors, setPlayerColors] = useState({})

  function handleSearch(q) {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      const data = await searchPlayers(q)
      setResults(data || [])
    }, 300)
    return () => clearTimeout(timer)
  }

  const usedIds = useMemo(() => {
    const used = {}
    cards.forEach(c => { used[c.player.player_id] = true })
    return used
  }, [cards])

  const comparedPlayers = useMemo(() => cards.map(c => c.player), [cards])

  const visiblePlayers = useMemo(() => {
    return comparedPlayers.filter(p => chartVisible[p.player_id] !== false)
  }, [comparedPlayers, chartVisible])

  const radarSeries = useMemo(() => {
    const scaleGroup = visiblePlayers.length > 0 ? visiblePlayers : comparedPlayers
    return comparedPlayers.map(p => {
      const norms = STAT_KEYS.map(key => {
        const val = parseFloat(p[key]) || 0
        let max = 0
        scaleGroup.forEach(sp => {
          const sv = parseFloat(sp[key]) || 0
          if (sv > max) max = sv
        })
        if (max === 0) max = 1
        return val / max
      })
      return {
        playerId: p.player_id,
        name: p.player_name,
        normValues: norms,
        color: playerColors[p.player_id] || '#5b8cff',
        visible: chartVisible[p.player_id] !== false,
      }
    })
  }, [comparedPlayers, visiblePlayers, chartVisible, playerColors])

  async function addPlayer(playerId) {
    if (usedIds[playerId]) return
    const data = await getPlayerById(playerId)
    if (!data) return
    const slotId = nextSlotId
    setNextSlotId(slotId + 1)
    setCards(prev => [...prev, { slotId, player: data }])
    setChartVisible(prev => ({ ...prev, [playerId]: true }))
    setPlayerColors(prev => ({ ...prev, [playerId]: '#5b8cff' }))
    setJustAddedSlotId(slotId)
    setTimeout(() => setJustAddedSlotId(null), 350)
    setIsPickerOpen(false)
    setQuery('')
    setResults([])
  }

  function removePlayer(playerId) {
    setCards(prev => prev.filter(c => c.player.player_id !== playerId))
  }

  function openPicker() {
    setQuery('')
    setResults([])
    setIsPickerOpen(true)
  }

  return (
    <main className="container">
      <section className="page-header">
        <p className="breadcrumb">Players / <span>Compare</span></p>
      </section>

      <section className="card panel compare-header">
        <div>
          <h1 className="page-title">Compare Players</h1>
          <p className="page-subtitle">
            Add players to see their stats overlaid on one radar chart. Use the color picker and "On chart" toggle to customize.
          </p>
        </div>
      </section>

      <section className="card panel radar-chart-panel">
        <div className="radar-chart-heading">
          <h2 className="radar-chart-title">Comparison Radar</h2>
          <p className="radar-chart-sub">PPG &middot; RPG &middot; APG &middot; FG%</p>
        </div>
        {comparedPlayers.length === 0 ? (
          <p className="radar-empty-hint radar-empty-hint--solo">Add players below to see overlapping radars.</p>
        ) : (
          <RadarChart series={radarSeries} />
        )}
        {comparedPlayers.length > 0 && visiblePlayers.length === 0 && (
          <p className="radar-empty-hint">Turn on "On chart" for at least one player.</p>
        )}
      </section>

      <section className="compare-row">
        {cards.map(c => (
          <ComparePlayerCard
            key={'slot-' + c.slotId}
            slotId={c.slotId}
            player={c.player}
            isJustAdded={justAddedSlotId === c.slotId}
            onChart={chartVisible[c.player.player_id] !== false}
            cardColor={playerColors[c.player.player_id] || '#5b8cff'}
            onToggleChart={() => setChartVisible(prev => ({ ...prev, [c.player.player_id]: prev[c.player.player_id] === false }))}
            onColorChange={hex => setPlayerColors(prev => ({ ...prev, [c.player.player_id]: normalizeHex(hex) }))}
            onColorReset={() => setPlayerColors(prev => ({ ...prev, [c.player.player_id]: '#5b8cff' }))}
            onRemove={() => removePlayer(c.player.player_id)}
          />
        ))}

        <button type="button" className="card panel add-card" onClick={openPicker}>
          <span className="plus">+</span>
          <span className="add-label">Add player</span>
          <span className="add-hint">Search &amp; compare stats</span>
        </button>
      </section>

      {isPickerOpen && (
        <PlayerPickerModal
          query={query}
          results={results}
          usedIds={usedIds}
          onSearch={handleSearch}
          onSelect={addPlayer}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

      <footer className="footer">StaxNYC Predictor &bull; Compare Players</footer>
    </main>
  )
}

import { useState, useMemo } from 'react'
import RadarChart from '../components/player/RadarChart'
import ComparePlayerCard, { normalizeHex } from '../components/compare/ComparePlayerCard'
import PlayerPickerModal from '../components/common/PlayerPickerModal'
import { getPlayerForCompare, searchPlayers } from '../lib/api'
import { pickUniqueCompareColor } from '../lib/compareColors'
import { buildRadarSeries, playerHasCompareStats, statLabel, STAT_KEYS } from '../lib/compareStats'
import './ComparePage.css'

const STAT_SUBTITLE = STAT_KEYS.map(statLabel).join(' · ')

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

  const radarSeries = useMemo(
    () => buildRadarSeries(comparedPlayers, { visibleIds: chartVisible, colors: playerColors }),
    [comparedPlayers, chartVisible, playerColors],
  )

  const anyVisibleHasStats = useMemo(
    () => visiblePlayers.some(playerHasCompareStats),
    [visiblePlayers],
  )

  async function addPlayer(playerId) {
    if (usedIds[playerId]) return
    const data = await getPlayerForCompare(playerId)
    if (!data) return
    const slotId = nextSlotId
    setNextSlotId(slotId + 1)
    setCards(prev => [...prev, { slotId, player: data }])
    setChartVisible(prev => ({ ...prev, [playerId]: true }))
    setPlayerColors(prev => ({ ...prev, [playerId]: pickUniqueCompareColor(prev) }))
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
            Add players to see their stats overlaid on one radar chart. Use the color picker and &quot;On chart&quot; toggle to customize who appears on the chart.
          </p>
        </div>
      </section>

      <section className="card panel radar-chart-panel">
        <div className="radar-chart-heading">
          <h2 className="radar-chart-title">Comparison Radar</h2>
          <p className="radar-chart-sub">{STAT_SUBTITLE}</p>
        </div>
        {comparedPlayers.length === 0 ? (
          <p className="radar-empty-hint radar-empty-hint--solo">Add players below to see overlapping radars.</p>
        ) : (
          <RadarChart series={radarSeries} />
        )}
        {comparedPlayers.length > 0 && visiblePlayers.length === 0 && (
          <p className="radar-empty-hint">Turn on "On chart" for at least one player.</p>
        )}
        {visiblePlayers.length > 0 && !anyVisibleHasStats && (
          <p className="radar-empty-hint">Selected players have no season or game-log stats to chart yet.</p>
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
            onColorReset={() => setPlayerColors(prev => {
              const { [c.player.player_id]: _removed, ...rest } = prev
              return { ...prev, [c.player.player_id]: pickUniqueCompareColor(rest) }
            })}
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

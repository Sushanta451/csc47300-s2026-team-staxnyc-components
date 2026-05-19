import { useRef, useEffect, useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return isNaN(d) ? dateStr : d.toLocaleDateString('en-US',{month:'short',day:'numeric'})
}

function PtsBar({ pts, max, isWin }) {
  const [w, setW] = useState(0)
  const pct = Math.round((pts / max) * 100)
  useEffect(() => { const t = setTimeout(() => setW(pct), 400); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{width:40,height:4,borderRadius:999,background:'rgba(255,255,255,0.07)',overflow:'hidden',marginTop:2}}>
      <div style={{
        height:'100%', borderRadius:999,
        background: isWin ? '#34d399' : '#f87171',
        width:`${w}%`,
        transition:'width 0.8s cubic-bezier(0.22,1,0.36,1)',
      }} />
    </div>
  )
}

export default function RecentGamesTable({ games }) {
  const tbodyRef = useRef(null)
  const [sortCol, setSortCol] = useState('game_date')
  const [sortDir, setSortDir] = useState('desc')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    if (!tbodyRef.current) return
    const trs = tbodyRef.current.querySelectorAll('tr')
    trs.forEach((tr, i) => {
      tr.style.animation = 'none'
      tr.offsetHeight
      tr.style.animation = `rowIn 0.4s cubic-bezier(0.22,1,0.36,1) both ${i*0.04}s`
    })
  }, [games, filter, sortCol, sortDir])

  const hasStl = games.some(g => g.stl != null)
  const hasBlk = games.some(g => g.blk != null)
  const hasFgm = games.some(g => g.fgm != null && g.fga != null)
  const maxPts = Math.max(...games.map(g => Number(g.pts)||0), 1)

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const sorted = [...games]
    .filter(g => filter === 'all' || g.result === filter)
    .sort((a, b) => {
      const aVal = sortCol === 'game_date' ? new Date(a.game_date) : Number(a[sortCol]) || 0
      const bVal = sortCol === 'game_date' ? new Date(b.game_date) : Number(b[sortCol]) || 0
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })

  const wins   = games.filter(g => g.result === 'W').length
  const losses = games.filter(g => g.result === 'L').length

  const SortTh = ({ col, label }) => {
    const active = sortCol === col
    return (
      <th onClick={() => toggleSort(col)} style={{
        fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.5px',
        color: active ? 'var(--accent)' : 'var(--muted)',
        fontWeight: active ? 700 : 600,
        cursor:'pointer', userSelect:'none',
        transition:'color 0.15s ease',
        whiteSpace:'nowrap',
      }}>
        {label}{active ? (sortDir==='desc'?'  ↓':'  ↑') : ''}
      </th>
    )
  }

  return (
    <>
      <article className="card section-card">
        <div className="section-header" style={{marginBottom:'0.75rem'}}>
          <div>
            <h2 className="section-title">Recent Games</h2>
            <p className="section-note" style={{marginTop:2}}>
              <span style={{color:'var(--success)',fontWeight:700}}>{wins}W</span>
              {' '}<span style={{color:'var(--muted)'}}>·</span>{' '}
              <span style={{color:'var(--danger)',fontWeight:700}}>{losses}L</span>
              {' '}in last {games.length} games
            </p>
          </div>

          <div style={{display:'flex',gap:4,background:'rgba(255,255,255,0.04)',borderRadius:8,padding:3}}>
            {[{v:'all',l:'All'},{v:'W',l:'Wins'},{v:'L',l:'Losses'}].map(({v,l}) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                padding:'0.22rem 0.55rem', borderRadius:6, border:'none', cursor:'pointer',
                fontFamily:'inherit', fontSize:'0.68rem', fontWeight:600,
                background: filter===v ? (v==='W'?'rgba(52,211,153,0.25)':v==='L'?'rgba(239,68,68,0.25)':'rgba(91,140,255,0.25)') : 'transparent',
                color: filter===v ? (v==='W'?'#34d399':v==='L'?'#f87171':'var(--accent)') : 'var(--muted)',
                transition:'all 0.2s ease',
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortTh col="game_date" label="Date" />
                <th style={{fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.5px',color:'var(--muted)',fontWeight:600}}>Opp</th>
                <SortTh col="pts" label="PTS" />
                <SortTh col="reb" label="REB" />
                <SortTh col="ast" label="AST" />
                {hasStl && <SortTh col="stl" label="STL" />}
                {hasBlk && <SortTh col="blk" label="BLK" />}
                {hasFgm && <th style={{fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.5px',color:'var(--muted)',fontWeight:600}}>FG</th>}
                <th style={{fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.5px',color:'var(--muted)',fontWeight:600}}>Result</th>
              </tr>
            </thead>
            <tbody ref={tbodyRef}>
              {sorted.map((g, i) => {
                const pts    = Number(g.pts) || 0
                const isWin  = g.result === 'W'
                const bigGame = pts >= 30
                const dd     = (Number(g.reb)||0) >= 10 && pts >= 10

                return (
                  <tr key={i} style={{
                    background: bigGame?'rgba(79,140,255,0.06)':dd?'rgba(52,211,153,0.04)':'transparent',
                    transition:'background 0.15s ease, transform 0.15s ease',
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.transform='translateX(3px)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background=bigGame?'rgba(79,140,255,0.06)':dd?'rgba(52,211,153,0.04)':'transparent';e.currentTarget.style.transform=''}}
                  >
                    <td style={{color:'var(--muted)',fontSize:'0.8rem',whiteSpace:'nowrap'}}>{formatDate(g.game_date)}</td>
                    <td style={{fontWeight:600,fontSize:'0.88rem'}}>{g.opponent||'—'}</td>
                    <td>
                      <div style={{fontFamily:'var(--font-mono)',fontWeight:700,color:bigGame?'var(--accent)':'var(--text)',fontSize:'0.9rem'}}>
                        {pts}
                      </div>
                      <PtsBar pts={pts} max={maxPts} isWin={isWin} />
                    </td>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:'0.88rem'}}>{g.reb??'—'}</td>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:'0.88rem'}}>{g.ast??'—'}</td>
                    {hasStl && <td style={{fontFamily:'var(--font-mono)',fontSize:'0.88rem'}}>{g.stl??'—'}</td>}
                    {hasBlk && <td style={{fontFamily:'var(--font-mono)',fontSize:'0.88rem'}}>{g.blk??'—'}</td>}
                    {hasFgm && <td style={{fontFamily:'var(--font-mono)',color:'var(--muted)',fontSize:'0.82rem'}}>{g.fgm}/{g.fga}</td>}
                    <td>
                      <span style={{
                        display:'inline-flex',alignItems:'center',justifyContent:'center',
                        width:28,height:28,borderRadius:8,
                        fontSize:'0.72rem',fontWeight:800,
                        background:isWin?'rgba(52,211,153,0.15)':'rgba(239,68,68,0.15)',
                        color:isWin?'#34d399':'#f87171',
                        border:`1px solid ${isWin?'rgba(52,211,153,0.3)':'rgba(239,68,68,0.3)'}`,
                        boxShadow:isWin?'0 0 8px rgba(52,211,153,0.25)':'0 0 8px rgba(239,68,68,0.25)',
                        transition:'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.2)';e.currentTarget.style.boxShadow=isWin?'0 0 14px rgba(52,211,153,0.5)':'0 0 14px rgba(239,68,68,0.5)'}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=isWin?'0 0 8px rgba(52,211,153,0.25)':'0 0 8px rgba(239,68,68,0.25)'}}
                      >{g.result??'—'}</span>
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={10} style={{textAlign:'center',color:'var(--muted)',padding:'1.5rem',fontSize:'0.85rem'}}>No games match this filter</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <style>{`
        @keyframes rowIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </>
  )
}

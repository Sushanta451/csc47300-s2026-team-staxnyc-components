import { useEffect, useState } from 'react'
import { getTeamBranding } from '../../lib/teamBranding'

function ShootingSplit({ label, value, color, delay = 0, max = 100 }) {
  const [width, setWidth] = useState(0)
  const [hov, setHov] = useState(false)
  const pct = parseFloat(value) || 0
  useEffect(() => { const t = setTimeout(() => setWidth(Math.min(pct, max)), delay); return () => clearTimeout(t) }, [pct, delay])

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:'grid', gap:'0.3rem', cursor:'default', padding:'0.35rem 0.5rem', borderRadius:8, background: hov?'rgba(255,255,255,0.03)':'transparent', transition:'background 0.2s ease' }}
    >
      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',alignItems:'center'}}>
        <span style={{color:'var(--muted)'}}>{label}</span>
        <span style={{
          color: hov ? color : 'var(--text)',
          fontWeight:700, fontFamily:'var(--font-mono)',
          transform: hov ? 'scale(1.1)' : 'scale(1)',
          display:'inline-block',
          transition:'transform 0.2s ease, color 0.2s ease',
        }}>
          {value!=null ? value+'%' : '—'}
        </span>
      </div>
      <div style={{height:7,borderRadius:999,background:'rgba(255,255,255,0.07)',overflow:'hidden',position:'relative'}}>
        <div style={{
          height:'100%', width:`${width}%`, borderRadius:999,
          background:color,
          transition:`width 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
          boxShadow: hov ? `0 0 12px ${color}` : `0 0 6px ${color}66`,
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute',inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation:'barShimmer 1.5s ease infinite', animationDelay:`${delay}ms` }} />
        </div>
      </div>
    </div>
  )
}

function FormCircle({ result, i }) {
  const isWin = result === 'W'
  return (
    <div style={{
      width:26, height:26, borderRadius:'50%',
      display:'grid', placeItems:'center',
      fontSize:'0.62rem', fontWeight:800,
      background: isWin ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)',
      color: isWin ? '#34d399' : '#f87171',
      border:`2px solid ${isWin ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}`,
      animation:`formChipPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both ${i*0.08}s`,
      boxShadow: isWin ? '0 0 8px rgba(52,211,153,0.3)' : '0 0 8px rgba(239,68,68,0.3)',
    }}>{result}</div>
  )
}

export default function PredictionCard({ stats, recentGames = [] }) {
  if (!stats) return null
  const [tab, setTab] = useState('splits')

  const branding  = getTeamBranding(stats.team)
  const teamColor = branding?.color || '#4f8cff'
  const logoUrl   = branding?.logoUrl || null

  const last5  = recentGames.slice(0, 5)
  const wins   = last5.filter(g => g.result === 'W').length
  const formLabel = wins>=4?'Hot':wins>=3?'Good form':wins>=2?'Mixed':'Cold'
  const formColor = wins>=4?'#34d399':wins>=3?'#4f8cff':wins>=2?'#f59e0b':'#f87171'

  const pts5 = last5.map(g => Number(g.pts) || 0)
  const maxPts = Math.max(...pts5, 1)

  return (
    <>
      <section className="card panel prediction-card" style={{position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:teamColor,borderRadius:'4px 0 0 4px',boxShadow:`2px 0 16px ${teamColor}55`}} />

        {logoUrl && (
          <img src={logoUrl} alt="" onError={e=>e.currentTarget.style.display='none'}
            style={{position:'absolute',right:'0.75rem',top:'0.75rem',width:44,height:44,objectFit:'contain',opacity:0.1,pointerEvents:'none'}} />
        )}

        <div style={{paddingLeft:'0.5rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
            <h3 style={{margin:0}}>Season Overview</h3>
            <div style={{display:'flex',gap:4,background:'rgba(255,255,255,0.05)',borderRadius:8,padding:3}}>
              {['splits','games'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding:'0.25rem 0.6rem', borderRadius:6, border:'none', cursor:'pointer',
                  fontFamily:'inherit', fontSize:'0.7rem', fontWeight:600,
                  background: tab===t ? teamColor : 'transparent',
                  color: tab===t ? '#fff' : 'var(--muted)',
                  transition:'all 0.2s ease',
                }}>{t === 'splits' ? 'Shooting' : 'Last 5'}</button>
              ))}
            </div>
          </div>

          {last5.length > 0 && (
            <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.85rem',flexWrap:'wrap'}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)',fontFamily:'var(--font-mono)',textTransform:'uppercase',letterSpacing:'0.08em'}}>L{last5.length}</span>
              <div style={{display:'flex',gap:4}}>
                {last5.map((g, i) => <FormCircle key={i} result={g.result} i={i} />)}
              </div>
              <span style={{fontSize:'0.72rem',color:formColor,fontWeight:700,marginLeft:2}}>{formLabel}</span>
            </div>
          )}

          {tab === 'splits' && (
            <div style={{display:'grid',gap:'0.2rem',animation:'tabIn 0.3s ease both'}}>
              <ShootingSplit label="Field Goal %" value={stats.fg_pct}    color={teamColor} delay={300} />
              <ShootingSplit label="3-Point %"    value={stats.three_pct} color="#818cf8"   delay={450} />
              <ShootingSplit label="Free Throw %"  value={stats.ft_pct}    color="#34d399"   delay={600} />
            </div>
          )}

          {tab === 'games' && pts5.length > 0 && (
            <div style={{animation:'tabIn 0.3s ease both'}}>
              <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80,padding:'0 4px'}}>
                {pts5.map((p, i) => {
                  const h = Math.max(8, Math.round((p / maxPts) * 100))
                  const isWin = last5[i]?.result === 'W'
                  return (
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,height:'100%',justifyContent:'flex-end'}}>
                      <div style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:'var(--font-mono)'}}>{p}</div>
                      <div style={{
                        width:'100%', height:`${h}%`,
                        borderRadius:'4px 4px 2px 2px',
                        background: isWin ? 'linear-gradient(180deg,#34d399,#059669)' : 'linear-gradient(180deg,#f87171,#dc2626)',
                        animation:`barGrow 0.6s cubic-bezier(0.22,1,0.36,1) both ${i*0.08}s`,
                        transformOrigin:'bottom',
                        boxShadow: isWin ? '0 0 8px rgba(52,211,153,0.4)' : '0 0 8px rgba(248,113,113,0.4)',
                      }} />
                      <div style={{fontSize:'0.55rem',color:isWin?'#34d399':'#f87171',fontWeight:700}}>{last5[i]?.result}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{marginTop:'0.5rem',fontSize:'0.68rem',color:'var(--muted)',textAlign:'center',fontFamily:'var(--font-mono)'}}>
                {wins}/{last5.length} wins in last {last5.length} games
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginTop:'0.85rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            {[{k:'PTS',v:stats.ppg,c:teamColor},{k:'REB',v:stats.rpg,c:'var(--success)'},{k:'AST',v:stats.apg,c:'#818cf8'},{k:'STL',v:stats.spg},{k:'BLK',v:stats.bpg}]
              .filter(x=>x.v!=null).map(({k,v,c},i) => (
              <div key={k} style={{textAlign:'center',minWidth:38,animation:`fadeUp 0.4s ease both ${0.5+i*0.06}s`}}>
                <div style={{fontSize:'0.95rem',fontWeight:700,fontFamily:'var(--font-mono)',color:c||'var(--text)'}}>{v}</div>
                <div style={{fontSize:'0.6rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes formChipPop { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
        @keyframes barShimmer { from{transform:translateX(-100%)} to{transform:translateX(200%)} }
        @keyframes tabIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes barGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
      `}</style>
    </>
  )
}

import { useState, useEffect } from 'react'
import { getPlayerImageUrl, getPlayerInitials } from '../../lib/playerImage'
import { getTeamBranding } from '../../lib/teamBranding'

function useCountUp(target, duration = 900, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf, start
    const t = setTimeout(() => {
      const num = parseFloat(target) || 0
      function step(ts) {
        if (!start) start = ts
        const p = Math.min((ts - start) / duration, 1)
        setVal(num * (1 - Math.pow(1 - p, 3)))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [target])
  const num = parseFloat(target) || 0
  return num % 1 !== 0 ? val.toFixed(1) : Math.round(val)
}

function AnimatedStatBox({ label, value, accent, delay = 0, rank }) {
  const [hov, setHov] = useState(false)
  const counted = useCountUp(value, 900, delay + 200)
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <div
      className="stat-box"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderColor: accent ? `${accent}44` : undefined,
        borderTopColor: accent || undefined,
        borderTopWidth: 2,
        opacity: vis ? 1 : 0,
        transform: vis ? (hov ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)') : 'translateY(20px) scale(0.88)',
        transition: 'opacity 0.5s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
        boxShadow: hov ? `0 16px 36px rgba(0,0,0,0.45), 0 0 24px ${accent || 'rgba(91,140,255,0.2)'}44` : undefined,
        cursor: 'default', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)',
        transform: hov ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.55s ease',
      }} />
      {rank && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          fontSize: '0.58rem', color: accent || 'var(--accent)',
          fontFamily: 'var(--font-mono)', fontWeight: 700, opacity: 0.7,
        }}>{rank}</div>
      )}
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color: accent || 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
        {value != null ? counted : '—'}
      </p>
    </div>
  )
}

function BannerParticles() {
  const ps = [
    {x:12,y:25,s:16,d:0,t:3.2},{x:78,y:55,s:11,d:0.8,t:2.8},
    {x:48,y:18,s:8,d:1.4,t:3.6},{x:88,y:38,s:20,d:0.3,t:2.5},{x:32,y:72,s:9,d:1.1,t:3.0},
  ]
  return <>
    {ps.map((p,i) => (
      <div key={i} style={{
        position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
        fontSize:p.s, opacity:0.1,
        animation:`particleFloat ${p.t}s ease-in-out ${p.d}s infinite`,
        pointerEvents:'none', userSelect:'none',
      }}>🏀</div>
    ))}
  </>
}

// Performance rating bar
function PerformanceRating({ ppg, rpg, apg, teamColor }) {
  const [w, setW] = useState(0)
  const score = Math.min(100, Math.round(
    ((parseFloat(ppg)||0) * 1.5 + (parseFloat(rpg)||0) * 1.2 + (parseFloat(apg)||0) * 1.8) / 0.65
  ))
  const label = score >= 80 ? '⭐ Elite' : score >= 65 ? '💪 Star' : score >= 50 ? '✅ Solid' : '📈 Rising'
  useEffect(() => { const t = setTimeout(() => setW(score), 600); return () => clearTimeout(t) }, [score])

  return (
    <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem' }}>
        <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Performance Rating</span>
        <span style={{ color: teamColor, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{label}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          background: `linear-gradient(90deg, ${teamColor}, ${teamColor}aa)`,
          width: `${w}%`,
          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: `0 0 12px ${teamColor}88`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',
            animation: 'shimBar 1.5s ease infinite',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.62rem', color: 'var(--muted)' }}>
        <span>0</span><span style={{ color: teamColor, fontWeight: 700 }}>{score}</span><span>100</span>
      </div>
    </div>
  )
}

export default function PlayerHeader({ stats }) {
  const [imgStatus, setImgStatus] = useState('loading')
  const [bannerReady, setBannerReady] = useState(false)
  const [avatarHov, setAvatarHov] = useState(false)
  const [nameVisible, setNameVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setBannerReady(true), 60)
    setTimeout(() => setNameVisible(true), 200)
  }, [])

  const { player_name, team, position, height, weight, jersey_number, ppg, rpg, apg, fg_pct, season, games_played, mpg, spg, bpg, tpg, three_pct, ft_pct } = stats
  const imageSrc = getPlayerImageUrl(stats)
  const initials = getPlayerInitials(player_name)
  const branding = getTeamBranding(team)
  const teamColor = branding?.color || '#4f8cff'
  const logoUrl = branding?.logoUrl || null

  return (
    <>
      <article className="card player-hero" style={{ overflow: 'hidden' }}>

        {/* Banner */}
        <div className="hero-top" style={{
          background: `linear-gradient(120deg, ${teamColor}ee, ${teamColor}55)`,
          position: 'relative', overflow: 'hidden',
          transformOrigin: 'left',
        }}>
          <div style={{ position:'absolute',inset:0, background:'repeating-linear-gradient(118deg,rgba(255,255,255,0.07) 0 6px,transparent 6px 20px)' }} />
          <BannerParticles />
          <svg style={{position:'absolute',right:0,bottom:0,opacity:0.1,pointerEvents:'none'}} width="240" height="140" viewBox="0 0 240 140">
            <path d="M 240 140 Q 120 -20 0 140" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="120" cy="45" r="32" fill="none" stroke="white" strokeWidth="1.5"/>
          </svg>
          {logoUrl && (
            <img src={logoUrl} alt={team} onError={e=>e.currentTarget.style.display='none'}
              style={{ position:'absolute',right:'1.25rem',top:'50%',transform:'translateY(-50%)', height:72,width:72,objectFit:'contain',opacity:0.9,filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }} />
          )}
          {jersey_number && (
            <div style={{
              position:'absolute',left:'1.5rem',bottom:'-0.5rem',
              fontSize:'5rem',fontWeight:900,color:'rgba(255,255,255,0.12)',
              lineHeight:1,userSelect:'none',fontFamily:'var(--font-mono)',
            }}>#{jersey_number}</div>
          )}
          <div style={{ position:'absolute',inset:0,pointerEvents:'none', background:`radial-gradient(ellipse at 30% 50%, ${teamColor}44, transparent 60%)`, animation:'bannerPulse 3s ease-in-out infinite' }} />
        </div>

        <div className="hero-body">
          <div className="player-main">

            {/* Avatar */}
            <div className="player-avatar"
              onMouseEnter={() => setAvatarHov(true)}
              onMouseLeave={() => setAvatarHov(false)}
              style={{
                borderColor: `${teamColor}66`,
                boxShadow: avatarHov
                  ? `0 0 0 4px ${teamColor}88, 0 0 50px ${teamColor}55`
                  : `0 0 0 2px ${teamColor}33`,
                transform: avatarHov ? 'scale(1.06)' : 'scale(1)',
                transition: 'box-shadow 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                animation: 'avatarDrop 0.6s cubic-bezier(0.22,1,0.36,1) both 0.3s',
                overflow: 'hidden', position: 'relative',
              }}
            >
              {imgStatus !== 'loaded' && (
                <div style={{ width:'100%',height:'100%',display:'grid',placeItems:'center',fontSize:'2rem',fontWeight:800,color:'rgba(255,255,255,0.3)',background:`linear-gradient(135deg,${teamColor}33,#0f1629)` }}>
                  {initials}
                </div>
              )}
              <img src={imageSrc} alt={player_name}
                onLoad={() => setImgStatus('loaded')}
                onError={() => setImgStatus('error')}
                style={{
                  position: imgStatus==='loaded'?'static':'absolute',
                  opacity: imgStatus==='loaded'?1:0,
                  width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',
                  transition:'opacity 0.35s ease, transform 0.4s ease',
                  transform: avatarHov?'scale(1.09)':'scale(1)',
                }}
              />
              <div style={{
                position:'absolute',inset:0,pointerEvents:'none',
                background:`radial-gradient(circle at 40% 30%, ${teamColor}44, transparent 70%)`,
                opacity: avatarHov?1:0, transition:'opacity 0.3s ease',
              }} />
            </div>

            {/* Name */}
            <div className="player-info">
              <div className="player-name-row">
                <h1 className="player-name" style={{
                  opacity: nameVisible?1:0,
                  transform: nameVisible?'translateX(0)':'translateX(-24px)',
                  transition:'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
                }}>{player_name}</h1>
                <span className="team-pill" style={{
                  borderColor:`${teamColor}55`, color:teamColor, background:`${teamColor}18`,
                  opacity: nameVisible?1:0,
                  transform: nameVisible?'scale(1)':'scale(0.6)',
                  transition:'opacity 0.4s ease 0.15s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.15s',
                }}>
                  {logoUrl && <img src={logoUrl} alt="" onError={e=>e.currentTarget.style.display='none'} style={{width:14,height:14,objectFit:'contain',marginRight:4}} />}
                  {team}
                </span>
              </div>
              <div className="player-meta" style={{
                opacity:nameVisible?1:0, transform:nameVisible?'translateY(0)':'translateY(8px)',
                transition:'opacity 0.4s ease 0.25s, transform 0.4s ease 0.25s',
              }}>
                {position && <span className="meta-chip">{position}</span>}
                {height   && <span className="meta-chip">{height}</span>}
                {weight   && <span className="meta-chip">{weight} lbs</span>}
                {jersey_number && <span className="meta-chip" style={{color:teamColor,borderColor:`${teamColor}44`}}>#{jersey_number}</span>}
              </div>
              <p style={{ color:'var(--muted)',fontSize:'0.75rem',marginTop:'0.5rem',fontFamily:'var(--font-mono)', opacity:nameVisible?1:0, transition:'opacity 0.4s ease 0.35s' }}>
                {season}{games_played&&` · ${games_played} GP`}{mpg&&` · ${mpg} MPG`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{marginTop:'1.1rem'}}>
            <AnimatedStatBox label="PPG" value={ppg} accent={teamColor} delay={300} />
            <AnimatedStatBox label="RPG" value={rpg} accent="var(--success)" delay={420} />
            <AnimatedStatBox label="APG" value={apg} accent="var(--accent-2,#818cf8)" delay={540} />
            <AnimatedStatBox label="FG%" value={fg_pct!=null?fg_pct:null} accent="var(--warning,#f59e0b)" delay={660} />
          </div>

          {/* Performance rating */}
          <PerformanceRating ppg={ppg} rpg={rpg} apg={apg} teamColor={teamColor} />

          {/* Extended chips */}
          {(spg!=null||bpg!=null||tpg!=null||three_pct!=null||ft_pct!=null) && (
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',marginTop:'0.75rem'}}>
              {[{l:'SPG',v:spg},{l:'BPG',v:bpg},{l:'TOV',v:tpg},{l:'3P%',v:three_pct!=null?three_pct+'%':null},{l:'FT%',v:ft_pct!=null?ft_pct+'%':null}]
                .filter(x=>x.v!=null).map(({l,v},i) => (
                <span key={l} className="ext-stat-chip" style={{animation:`chipPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both ${0.8+i*0.07}s`}}>
                  {l} <strong>{v}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      <style>{`
        @keyframes bannerPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes avatarDrop { from{opacity:0;transform:translateY(20px) scale(.85)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes chipPop { from{opacity:0;transform:scale(.5) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes particleFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-8px) rotate(120deg)} 66%{transform:translateY(4px) rotate(240deg)} }
        @keyframes shimBar { from{transform:translateX(-100%)} to{transform:translateX(200%)} }
      `}</style>
    </>
  )
}

import { useState } from 'react'

function BlockSwat({ playing }) {
  return (
    <div className="anim-stage">
      {playing && (
        <>
          <div className="bs-flash" />
          <div className="bs-ball" />
          <div className="bs-hand" />
        </>
      )}
      <div className="anim-label">Cleveland 18, NY 22</div>
    </div>
  )
}

function SpursSpotlight({ playing }) {
  return (
    <div className="anim-stage ss-stage">
      {playing && (
        <>
          <div className="ss-sweep" />
          <div className="ss-vignette" />
        </>
      )}
      <div className={'ss-text' + (playing ? ' play' : '')}>
        VICTOR WEMBANYAMA
      </div>
      <div className="anim-label">Spurs · #1</div>
    </div>
  )
}

function ConfettiBurst({ playing }) {
  const pieces = Array.from({ length: 24 })
  return (
    <div className="anim-stage cb-stage">
      <div className="cb-portrait">VW</div>
      {playing && pieces.map((_, i) => {
        const angle = (i * 15) + Math.random() * 10
        const dist = 60 + Math.random() * 80
        const delay = Math.random() * 0.15
        const color = i % 2 === 0 ? '#c8c9cf' : '#0b0c10'
        return (
          <div
            key={i}
            className="cb-piece"
            style={{
              background: color,
              transform: `rotate(${angle}deg) translateY(-${dist}px)`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

function WembyDunk({ playing }) {
  return (
    <div className="anim-stage wd-stage">
      <svg viewBox="0 0 320 240" className={'wd-svg' + (playing ? ' play' : '')}>
        <defs>
          <radialGradient id="ballGrad" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#ff9344" />
            <stop offset="80%" stopColor="#cc4a00" />
          </radialGradient>
          <clipPath id="bbHeadClip"><circle cx="0" cy="0" r="28" /></clipPath>
        </defs>

        <line x1="0" y1="208" x2="320" y2="208"
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 6" />

        <g className="cart-hoop">
          <rect x="240" y="20" width="56" height="42" rx="2"
            fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <rect x="252" y="28" width="32" height="22" rx="1"
            fill="none" stroke="rgba(255,80,80,0.8)" strokeWidth="1.3" />
          <ellipse className="cart-rim" cx="240" cy="66" rx="24" ry="4.5"
            fill="none" stroke="#e05a00" strokeWidth="3.5" />
          <path d="M 218 68 Q 228 86 235 100" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <path d="M 240 68 Q 240 86 240 100" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <path d="M 262 68 Q 252 86 245 100" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        </g>

        <g className="cart-motion">
          <path d="M 60 200 Q 100 160 130 130" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 50 195 Q 95 140 125 110" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 75 215 Q 115 175 145 145" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>

        <g className="cart-burst">
          <g transform="translate(240, 68)">
            <line x1="0" y1="-22" x2="0" y2="-38" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" />
            <line x1="14" y1="-14" x2="26" y2="-26" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" />
            <line x1="22" y1="0" x2="40" y2="0" stroke="#ff9344" strokeWidth="3" strokeLinecap="round" />
            <line x1="14" y1="14" x2="26" y2="26" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="22" x2="0" y2="38" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" />
            <line x1="-14" y1="14" x2="-26" y2="26" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" />
            <line x1="-22" y1="0" x2="-40" y2="0" stroke="#ff9344" strokeWidth="3" strokeLinecap="round" />
            <line x1="-14" y1="-14" x2="-26" y2="-26" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>

        <text className="cart-slam" x="160" y="60"
          fontFamily="Impact, 'Arial Black', sans-serif" fontWeight="900" fontSize="32"
          fill="#ffd24a" stroke="#0b0c10" strokeWidth="2" textAnchor="middle"
          letterSpacing="2">SLAM!</text>

        <ellipse className="bb-shadow" cx="80" cy="208" rx="24" ry="3.5" fill="rgba(0,0,0,0.6)" />
        <g className="cart-dust">
          <circle cx="148" cy="206" r="3" fill="rgba(255,255,255,0.5)" />
          <circle cx="155" cy="200" r="2" fill="rgba(255,255,255,0.4)" />
          <circle cx="195" cy="204" r="2.5" fill="rgba(255,255,255,0.45)" />
          <circle cx="200" cy="198" r="2" fill="rgba(255,255,255,0.4)" />
        </g>

        <g className="bb-figure">
          <line x1="0" y1="0" x2="-16" y2="24" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="24" x2="-22" y2="54" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <rect x="-7" y="-4" width="14" height="38" rx="3" fill="#0b0c10" transform="rotate(-12)" />
          <text x="0" y="22" fontFamily="Impact, sans-serif" fontWeight="900" fontSize="14"
            fill="#c8c9cf" textAnchor="middle">1</text>
          <line x1="0" y1="0" x2="20" y2="16" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="20" y1="16" x2="42" y2="4" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="0" x2="26" y2="-10" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="26" y1="-10" x2="58" y2="-34" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <ellipse className="bb-ball" cx="62" cy="-36" rx="7" ry="7"
            fill="url(#ballGrad)" stroke="#7a3000" strokeWidth="0.6" />

          <g className="bb-head" transform="translate(0, -32)">
            <ellipse cx="0" cy="2" rx="29" ry="30" fill="#0b0c10" opacity="0.5" />
            <image href="https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png"
              x="-32" y="-32" width="64" height="64"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#bbHeadClip)" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#c8c9cf" strokeWidth="2" />
          </g>
        </g>
      </svg>

      <div className="anim-label">SAS · #1 · 7'4"</div>
    </div>
  )
}

function HeightMeasure({ playing }) {
  return (
    <div className="anim-stage hm-stage">
      <div className={'hm-ruler' + (playing ? ' play' : '')}>
        {[0,1,2,3,4,5,6,7].map((i) => (
          <div key={i} className="hm-tick">
            <span className="hm-tick-label">{i + 1}'</span>
          </div>
        ))}
        <div className={'hm-marker' + (playing ? ' play' : '')}>
          7'4"
        </div>
      </div>
      <div className="hm-silhouette" />
    </div>
  )
}

const ANIMS = [
  { id: 'A', name: 'Block swat',       desc: 'Ball flies up, hand swats it, silver flash',     Component: BlockSwat },
  { id: 'B', name: 'Spurs spotlight',  desc: 'Silver gradient sweep across the page',          Component: SpursSpotlight },
  { id: 'C', name: 'Confetti burst',   desc: 'Silver + black particles burst from headshot',   Component: ConfettiBurst },
  { id: 'D', name: 'Height ruler',     desc: 'Ruler slides up showing 7\'4" tick mark',        Component: HeightMeasure },
  { id: 'E', name: 'Wemby dunk',       desc: 'Wemby silhouette rises, slams the ball through', Component: WembyDunk },
]

export default function WembyAnimDemoPage() {
  const [playing, setPlaying] = useState({})
  const [tick, setTick] = useState(0)

  function play(id) {
    setTick(t => t + 1)
    setPlaying((p) => ({ ...p, [id]: false }))
    setTimeout(() => setPlaying((p) => ({ ...p, [id]: true })), 30)
  }

  function playAll() {
    ANIMS.forEach((a) => play(a.id))
  }

  return (
    <main className="container anim-demo-shell">
      <header className="anim-demo-header">
        <h1>Wemby animation preview</h1>
        <p style={{ color: 'var(--muted)' }}>
          Each card plays a different animation. Pick the one you want, then tell me the letter.
        </p>
        <button className="btn primary" onClick={playAll}>Play all</button>
      </header>

      <div className="anim-grid">
        {ANIMS.map((a) => {
          const C = a.Component
          return (
            <div key={a.id + '-' + tick} className="card panel anim-card">
              <div className="anim-card-head">
                <span className="anim-letter">{a.id}</span>
                <div>
                  <h3 className="anim-name">{a.name}</h3>
                  <p className="anim-desc">{a.desc}</p>
                </div>
                <button className="btn-ghost" onClick={() => play(a.id)}>Replay</button>
              </div>
              <C playing={!!playing[a.id]} />
            </div>
          )
        })}
      </div>

      <style>{`
        .anim-demo-shell { padding-bottom: 4rem; }
        .anim-demo-header { margin: 1.5rem 0 1.25rem; display: grid; gap: 0.5rem; }
        .anim-demo-header h1 { margin: 0; font-size: 1.8rem; font-weight: 800; }
        .anim-demo-header .btn { width: fit-content; }

        .anim-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        .anim-card { padding: 1rem 1.1rem 1.25rem; }
        .anim-card-head {
          display: grid;
          grid-template-columns: 32px 1fr auto;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .anim-letter {
          display: grid; place-items: center;
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, rgba(79, 140, 255, 0.22), rgba(124, 92, 255, 0.18));
          border: 1px solid rgba(79, 140, 255, 0.3);
          font-family: var(--font-mono); font-weight: 800; font-size: 0.95rem;
        }
        .anim-name { margin: 0; font-size: 1rem; font-weight: 700; }
        .anim-desc { margin: 0.1rem 0 0; font-size: 0.78rem; color: var(--muted); }

        .anim-stage {
          position: relative;
          height: 280px;
          border-radius: 12px;
          background:
            radial-gradient(ellipse at top, rgba(200,201,207,0.08), transparent 70%),
            #0a0e18;
          border: 1px solid rgba(255, 255, 255, 0.07);
          overflow: hidden;
        }
        .anim-label {
          position: absolute; bottom: 10px; left: 12px;
          color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem;
          letter-spacing: 0.08em;
        }

        /* A — Block swat */
        .bs-ball {
          position: absolute; left: 50%; bottom: 0;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #ff9344, #cc4a00 70%);
          box-shadow: 0 0 16px rgba(255, 140, 0, 0.5);
          animation: bsBall 1.2s cubic-bezier(0.34, 1.2, 0.45, 0.95) forwards;
          margin-left: -14px;
        }
        .bs-hand {
          position: absolute; left: 50%; top: 30%;
          width: 80px; height: 60px;
          margin-left: -40px;
          background: linear-gradient(135deg, #d8d9dd, #6b6c70);
          border-radius: 12px 32px 6px 16px;
          opacity: 0;
          transform: translateX(80px) rotate(-25deg);
          animation: bsHand 0.5s ease-out 0.55s forwards;
        }
        .bs-flash {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 38%, rgba(200,201,207,0.55), transparent 50%);
          opacity: 0;
          animation: bsFlash 0.35s ease-out 0.65s;
        }
        @keyframes bsBall {
          0%   { transform: translateY(0) rotate(0); }
          55%  { transform: translateY(-160px) rotate(220deg); }
          65%  { transform: translateY(-150px) rotate(280deg); }
          100% { transform: translate(120px, -40px) rotate(720deg); opacity: 0; }
        }
        @keyframes bsHand {
          from { transform: translateX(80px) rotate(-25deg); opacity: 0; }
          50%  { transform: translateX(0) rotate(0); opacity: 1; }
          to   { transform: translateX(-50px) rotate(15deg); opacity: 0; }
        }
        @keyframes bsFlash {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          100% { opacity: 0; }
        }

        /* B — Spurs spotlight */
        .ss-stage { display: grid; place-items: center; }
        .ss-sweep {
          position: absolute; inset: -10% -50%;
          background: linear-gradient(110deg,
            transparent 0%, transparent 35%,
            rgba(200, 201, 207, 0.7) 50%,
            transparent 65%, transparent 100%);
          transform: translateX(-100%);
          animation: ssSweep 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .ss-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 50% at 50% 50%, transparent, rgba(0,0,0,0.7));
          opacity: 0; animation: ssVig 1.4s ease-out forwards;
        }
        .ss-text {
          position: relative; z-index: 2;
          color: #eef0f8;
          font-family: 'Impact', 'Arial Black', sans-serif;
          font-weight: 900; font-size: 1.4rem; letter-spacing: 0.06em;
          text-align: center; padding: 0 1rem;
          opacity: 0; transform: translateY(15px);
          text-shadow: 0 0 18px rgba(200, 201, 207, 0.6);
        }
        .ss-text.play { animation: ssText 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards; }
        @keyframes ssSweep {
          to { transform: translateX(80%); }
        }
        @keyframes ssVig {
          0%   { opacity: 0; }
          50%  { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes ssText {
          to { opacity: 1; transform: translateY(0); }
        }

        /* C — Confetti burst */
        .cb-stage { display: grid; place-items: center; }
        .cb-portrait {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(200,201,207,0.3), rgba(255,255,255,0.05));
          border: 2px solid rgba(200, 201, 207, 0.35);
          display: grid; place-items: center;
          font-family: var(--font-mono); font-weight: 800; font-size: 1.4rem;
          color: var(--text);
          z-index: 2;
        }
        .cb-piece {
          position: absolute; left: 50%; top: 50%;
          width: 8px; height: 14px;
          margin-left: -4px; margin-top: -7px;
          border-radius: 1px;
          transform-origin: center;
          animation: cbPiece 1.2s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
        }
        @keyframes cbPiece {
          0%   { opacity: 0; transform: rotate(0deg) translateY(0) scale(0.5); }
          15%  { opacity: 1; }
          100% { opacity: 0; transform: var(--final, rotate(0) translateY(-140px) scale(0.6)); }
        }
        .cb-piece {
          --final: rotate(var(--angle, 0deg)) translateY(-100px) scale(0.7);
        }

        /* D — Height ruler */
        .hm-stage { display: grid; place-items: end center; padding-bottom: 24px; }
        .hm-ruler {
          position: relative;
          width: 60px; height: 220px;
          background: linear-gradient(to top, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          transform: translateY(220px);
          opacity: 0;
        }
        .hm-ruler.play { animation: hmRuler 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .hm-tick {
          position: absolute; left: 0; right: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.18);
        }
        .hm-tick:nth-child(1) { top: 12.5%; }
        .hm-tick:nth-child(2) { top: 25%; }
        .hm-tick:nth-child(3) { top: 37.5%; }
        .hm-tick:nth-child(4) { top: 50%; }
        .hm-tick:nth-child(5) { top: 62.5%; }
        .hm-tick:nth-child(6) { top: 75%; }
        .hm-tick:nth-child(7) { top: 87.5%; }
        .hm-tick:nth-child(8) { top: 100%; display:none; }
        .hm-tick-label {
          position: absolute; left: -22px; top: -7px;
          font-family: var(--font-mono); font-size: 0.65rem; color: var(--muted);
        }
        .hm-marker {
          position: absolute; right: -90px; top: 8%;
          padding: 0.35rem 0.7rem;
          background: linear-gradient(135deg, rgba(79, 140, 255, 0.3), rgba(124, 92, 255, 0.2));
          border: 1px solid rgba(79, 140, 255, 0.4);
          border-radius: 6px;
          color: var(--text); font-family: var(--font-mono); font-weight: 700; font-size: 0.95rem;
          white-space: nowrap;
          opacity: 0; transform: translateX(-10px);
        }
        .hm-marker.play { animation: hmMarker 0.5s ease-out 0.8s forwards; }
        .hm-silhouette {
          position: absolute; right: 30%; bottom: 24px;
          width: 14px; height: 200px;
          background: linear-gradient(to top, rgba(200, 201, 207, 0.12), transparent);
          border-radius: 8px 8px 0 0;
        }
        @keyframes hmRuler {
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes hmMarker {
          to { opacity: 1; transform: translateX(0); }
        }

        /* E — Wemby bobblehead dunk (cartoon side view) */
        .wd-stage { display: grid; place-items: center; padding: 0; }
        .wd-svg { width: 100%; max-width: 340px; height: 100%; display: block; }

        .wd-svg .bb-figure { transform: translate(80px, 175px); }
        .wd-svg.play .bb-figure { animation: bbLeap 2.4s cubic-bezier(0.45, 0, 0.3, 1) forwards; }

        .wd-svg .bb-head { transform-origin: 0 0; }
        .wd-svg.play .bb-head { animation: bbBobble 0.9s ease-out 1.6s; }

        .wd-svg .bb-shadow { transform-origin: 80px 208px; }
        .wd-svg.play .bb-shadow { animation: bbShadow 2.4s cubic-bezier(0.45, 0, 0.3, 1) forwards; }

        .wd-svg.play .cart-rim {
          animation: bbRimShake 0.6s ease-in-out 1.1s;
          transform-origin: 240px 66px;
        }

        .wd-svg .cart-motion { opacity: 0; }
        .wd-svg.play .cart-motion { animation: cartMotion 1.2s ease-out 0.15s; }

        .wd-svg .cart-burst { opacity: 0; transform-origin: 240px 68px; transform: scale(0.4); }
        .wd-svg.play .cart-burst { animation: cartBurst 0.5s ease-out 1.05s; }

        .wd-svg .cart-slam { opacity: 0; transform-origin: 160px 60px; transform: scale(0.6); }
        .wd-svg.play .cart-slam { animation: cartSlam 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1.05s forwards; }

        .wd-svg .cart-dust { opacity: 0; }
        .wd-svg.play .cart-dust { animation: cartDust 0.7s ease-out 1.85s; }

        @keyframes bbLeap {
          0%   { transform: translate(80px, 170px); }
          12%  { transform: translate(80px, 184px); }
          42%  { transform: translate(150px, 90px); }
          55%  { transform: translate(168px, 78px); }
          68%  { transform: translate(168px, 78px); }
          84%  { transform: translate(172px, 158px); }
          90%  { transform: translate(170px, 174px); }
          100% { transform: translate(170px, 170px); }
        }
        @keyframes bbBobble {
          0%   { transform: rotate(0deg); }
          22%  { transform: rotate(-14deg); }
          48%  { transform: rotate(10deg); }
          72%  { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes bbShadow {
          0%   { transform: translateX(0) scaleX(1); opacity: 0.55; }
          12%  { transform: translateX(0) scaleX(1.1); opacity: 0.62; }
          42%  { transform: translateX(70px) scaleX(0.35); opacity: 0.2; }
          55%  { transform: translateX(88px) scaleX(0.3); opacity: 0.18; }
          68%  { transform: translateX(88px) scaleX(0.3); opacity: 0.18; }
          84%  { transform: translateX(90px) scaleX(0.85); opacity: 0.5; }
          90%  { transform: translateX(90px) scaleX(1.25); opacity: 0.7; }
          100% { transform: translateX(90px) scaleX(1); opacity: 0.55; }
        }
        @keyframes bbRimShake {
          0%, 100% { transform: translateY(0) scaleX(1); }
          22%      { transform: translateY(4px) scaleX(1.12); }
          48%      { transform: translateY(-3px) scaleX(0.93); }
          74%      { transform: translateY(2px) scaleX(1.05); }
        }
        @keyframes cartMotion {
          0%   { opacity: 0; }
          30%  { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes cartBurst {
          0%   { opacity: 0; transform: scale(0.4); }
          20%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes cartSlam {
          0%   { opacity: 0; transform: scale(0.5) rotate(-8deg); }
          20%  { opacity: 1; transform: scale(1.15) rotate(2deg); }
          50%  { transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.95) rotate(0deg); }
        }
        @keyframes cartDust {
          0%   { opacity: 0; transform: translateY(0); }
          30%  { opacity: 1; transform: translateY(-6px); }
          100% { opacity: 0; transform: translateY(-14px); }
        }
      `}</style>
    </main>
  )
}

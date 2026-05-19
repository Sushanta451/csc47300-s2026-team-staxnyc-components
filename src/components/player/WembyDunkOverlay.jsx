import { useEffect, useState } from 'react'

export default function WembyDunkOverlay() {
  const [phase, setPhase] = useState('playing')

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 2600)
    const gone = setTimeout(() => setPhase('gone'), 3400)
    return () => { clearTimeout(fade); clearTimeout(gone) }
  }, [])

  if (phase === 'gone') return null

  return (
    <div className={'wdo-overlay' + (phase === 'fading' ? ' fading' : '')}>
      <svg viewBox="0 0 320 240" className="wdo-svg play">
        <defs>
          <radialGradient id="wdoBall" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#ff9344" />
            <stop offset="80%" stopColor="#cc4a00" />
          </radialGradient>
          <clipPath id="wdoHeadClip"><circle cx="0" cy="0" r="28" /></clipPath>
        </defs>

        <line x1="0" y1="208" x2="320" y2="208"
          stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 6" />

        <g className="wdo-hoop">
          <rect x="240" y="20" width="56" height="42" rx="2"
            fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <rect x="252" y="28" width="32" height="22" rx="1"
            fill="none" stroke="rgba(255,80,80,0.8)" strokeWidth="1.3" />
          <ellipse className="wdo-rim" cx="240" cy="66" rx="24" ry="4.5"
            fill="none" stroke="#e05a00" strokeWidth="3.5" />
          <path d="M 218 68 Q 228 86 235 100" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M 240 68 Q 240 86 240 100" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M 262 68 Q 252 86 245 100" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </g>

        <g className="wdo-motion">
          <path d="M 60 200 Q 100 160 130 130" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 50 195 Q 95 140 125 110" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 75 215 Q 115 175 145 145" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>

        <g className="wdo-burst">
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

        <text className="wdo-slam" x="160" y="60"
          fontFamily="Impact, 'Arial Black', sans-serif" fontWeight="900" fontSize="32"
          fill="#ffd24a" stroke="#0b0c10" strokeWidth="2" textAnchor="middle"
          letterSpacing="2">SLAM!</text>

        <ellipse className="wdo-shadow" cx="80" cy="208" rx="24" ry="3.5" fill="rgba(0,0,0,0.6)" />
        <g className="wdo-dust">
          <circle cx="148" cy="206" r="3" fill="rgba(255,255,255,0.7)" />
          <circle cx="155" cy="200" r="2" fill="rgba(255,255,255,0.5)" />
          <circle cx="195" cy="204" r="2.5" fill="rgba(255,255,255,0.6)" />
          <circle cx="200" cy="198" r="2" fill="rgba(255,255,255,0.5)" />
        </g>

        <g className="wdo-figure">
          <line x1="0" y1="0" x2="-16" y2="24" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="24" x2="-22" y2="54" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <rect x="-7" y="-4" width="14" height="38" rx="3" fill="#0b0c10" transform="rotate(-12)" />
          <text x="0" y="22" fontFamily="Impact, sans-serif" fontWeight="900" fontSize="14"
            fill="#c8c9cf" textAnchor="middle">1</text>
          <line x1="0" y1="0" x2="20" y2="16" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="20" y1="16" x2="42" y2="4" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="0" y1="0" x2="26" y2="-10" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <line x1="26" y1="-10" x2="58" y2="-34" stroke="#0b0c10" strokeWidth="6" strokeLinecap="round" />
          <ellipse className="wdo-ball" cx="62" cy="-36" rx="7" ry="7"
            fill="url(#wdoBall)" stroke="#7a3000" strokeWidth="0.6" />

          <g className="wdo-head" transform="translate(0, -32)">
            <ellipse cx="0" cy="2" rx="29" ry="30" fill="#0b0c10" opacity="0.5" />
            <image href="https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png"
              x="-32" y="-32" width="64" height="64"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#wdoHeadClip)" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#c8c9cf" strokeWidth="2" />
          </g>
        </g>
      </svg>

      <style>{`
        .wdo-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0.85));
          pointer-events: none;
          animation: wdoIn 0.25s ease-out;
        }
        .wdo-overlay.fading { animation: wdoOut 0.8s ease-in forwards; }
        .wdo-svg { width: min(620px, 92vw); height: auto; display: block; }

        @keyframes wdoIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wdoOut { from { opacity: 1; } to { opacity: 0; } }

        .wdo-svg .wdo-figure { transform: translate(80px, 175px); }
        .wdo-svg.play .wdo-figure { animation: wdoLeap 2.4s cubic-bezier(0.45, 0, 0.3, 1) forwards; }

        .wdo-svg .wdo-head { transform-origin: 0 0; }
        .wdo-svg.play .wdo-head { animation: wdoBobble 0.9s ease-out 1.6s; }

        .wdo-svg .wdo-shadow { transform-origin: 80px 208px; }
        .wdo-svg.play .wdo-shadow { animation: wdoShadow 2.4s cubic-bezier(0.45, 0, 0.3, 1) forwards; }

        .wdo-svg.play .wdo-rim {
          animation: wdoRimShake 0.6s ease-in-out 1.1s;
          transform-origin: 240px 66px;
        }

        .wdo-svg .wdo-motion { opacity: 0; }
        .wdo-svg.play .wdo-motion { animation: wdoMotion 1.2s ease-out 0.15s; }

        .wdo-svg .wdo-burst { opacity: 0; transform-origin: 240px 68px; transform: scale(0.4); }
        .wdo-svg.play .wdo-burst { animation: wdoBurst 0.5s ease-out 1.05s; }

        .wdo-svg .wdo-slam { opacity: 0; transform-origin: 160px 60px; transform: scale(0.6); }
        .wdo-svg.play .wdo-slam { animation: wdoSlam 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1.05s forwards; }

        .wdo-svg .wdo-dust { opacity: 0; }
        .wdo-svg.play .wdo-dust { animation: wdoDust 0.7s ease-out 1.85s; }

        @keyframes wdoLeap {
          0%   { transform: translate(80px, 175px); }
          12%  { transform: translate(80px, 184px); }
          42%  { transform: translate(150px, 90px); }
          55%  { transform: translate(168px, 78px); }
          68%  { transform: translate(168px, 78px); }
          84%  { transform: translate(172px, 158px); }
          90%  { transform: translate(170px, 174px); }
          100% { transform: translate(170px, 170px); }
        }
        @keyframes wdoBobble {
          0%, 100% { transform: rotate(0deg); }
          22%      { transform: rotate(-14deg); }
          48%      { transform: rotate(10deg); }
          72%      { transform: rotate(-5deg); }
        }
        @keyframes wdoShadow {
          0%   { transform: translateX(0) scaleX(1); opacity: 0.6; }
          12%  { transform: translateX(0) scaleX(1.1); opacity: 0.7; }
          42%  { transform: translateX(70px) scaleX(0.35); opacity: 0.2; }
          55%  { transform: translateX(88px) scaleX(0.3); opacity: 0.18; }
          68%  { transform: translateX(88px) scaleX(0.3); opacity: 0.18; }
          84%  { transform: translateX(90px) scaleX(0.85); opacity: 0.55; }
          90%  { transform: translateX(90px) scaleX(1.25); opacity: 0.75; }
          100% { transform: translateX(90px) scaleX(1); opacity: 0.6; }
        }
        @keyframes wdoRimShake {
          0%, 100% { transform: translateY(0) scaleX(1); }
          22%      { transform: translateY(4px) scaleX(1.12); }
          48%      { transform: translateY(-3px) scaleX(0.93); }
          74%      { transform: translateY(2px) scaleX(1.05); }
        }
        @keyframes wdoMotion {
          0%   { opacity: 0; }
          30%  { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes wdoBurst {
          0%   { opacity: 0; transform: scale(0.4); }
          20%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes wdoSlam {
          0%   { opacity: 0; transform: scale(0.5) rotate(-8deg); }
          20%  { opacity: 1; transform: scale(1.15) rotate(2deg); }
          50%  { transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.95) rotate(0deg); }
        }
        @keyframes wdoDust {
          0%   { opacity: 0; transform: translateY(0); }
          30%  { opacity: 1; transform: translateY(-6px); }
          100% { opacity: 0; transform: translateY(-14px); }
        }
      `}</style>
    </div>
  )
}

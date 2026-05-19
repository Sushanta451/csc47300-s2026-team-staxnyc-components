import { useState, useEffect } from 'react'

export default function WembyDunkAnim() {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPlaying(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
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

      <style>{`
        .anim-stage {
          position: relative;
          height: 280px;
          border-radius: 12px;
          background:
            radial-gradient(ellipse at top, rgba(200,201,207,0.08), transparent 70%),
            #0a0e18;
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .anim-label {
          position: absolute; bottom: 10px; left: 12px;
          color: var(--muted); font-size: 0.72rem;
          letter-spacing: 0.08em;
        }
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
    </>
  )
}

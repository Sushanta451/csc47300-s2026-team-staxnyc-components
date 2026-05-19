import { useEffect, useState } from 'react'

export default function WembyDunkOverlay() {
  const [phase, setPhase] = useState('playing')

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 10000)
    const gone = setTimeout(() => setPhase('gone'),  10800)
    return () => { clearTimeout(fade); clearTimeout(gone) }
  }, [])

  if (phase === 'gone') return null

  return (
    <div className={'wdo-overlay' + (phase === 'fading' ? ' fading' : '')}>
      <video
        src="/wemby-dunk.mp4"
        autoPlay
        muted
        playsInline
        className="wdo-video"
      />
      <style>{`
        .wdo-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.75);
          pointer-events: none;
          animation: wdoIn 0.3s ease-out;
        }
        .wdo-overlay.fading { animation: wdoOut 0.8s ease-in forwards; }
        .wdo-video {
          width: min(680px, 80vw);
          height: auto;
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        }
        @keyframes wdoIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wdoOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  )
}

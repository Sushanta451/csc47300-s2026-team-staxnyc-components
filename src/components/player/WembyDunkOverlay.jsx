import { useEffect, useState } from 'react'

export default function WembyDunkOverlay() {
  const [phase, setPhase] = useState('playing')

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 15500)
    const gone = setTimeout(() => setPhase('gone'),  16300)
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
          background: #000;
          pointer-events: none;
          animation: wdoIn 0.3s ease-out;
        }
        .wdo-overlay.fading { animation: wdoOut 0.8s ease-in forwards; }
        .wdo-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        @keyframes wdoIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wdoOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  )
}

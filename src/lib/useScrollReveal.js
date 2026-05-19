import { useEffect } from 'react'

const STYLE_ID = 'scroll-reveal-css'

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    [data-scroll] {
      opacity: 0;
      transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                  transform 0.65s cubic-bezier(0.22,1,0.36,1);
    }
    [data-scroll="up"]    { transform: translateY(48px); }
    [data-scroll="left"]  { transform: translateX(-48px); }
    [data-scroll="right"] { transform: translateX(48px); }
    [data-scroll="scale"] { transform: scale(0.88) translateY(20px); }
    [data-scroll].sr-visible {
      opacity: 1 !important;
      transform: none !important;
    }
  `
  document.head.appendChild(style)
}

export function useScrollReveal(deps = []) {
  useEffect(() => {
    injectStyles()

    const els = document.querySelectorAll('[data-scroll]:not(.sr-visible)')
    if (!els.length) return

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.dataset.scrollDelay) || 0
          setTimeout(() => e.target.classList.add('sr-visible'), delay)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' })

    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

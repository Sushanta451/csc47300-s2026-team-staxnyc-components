export function initScrollAnimations() {
  const style = document.createElement('style')
  style.textContent = `
    .scroll-fade-up,
    .scroll-fade-left,
    .scroll-fade-right,
    .scroll-scale {
      opacity: 0;
      will-change: transform, opacity;
    }

    .scroll-fade-up    { transform: translateY(40px); }
    .scroll-fade-left  { transform: translateX(-40px); }
    .scroll-fade-right { transform: translateX(40px); }
    .scroll-scale      { transform: scale(0.88); }

    .scroll-fade-up.in,
    .scroll-fade-left.in,
    .scroll-fade-right.in,
    .scroll-scale.in {
      opacity: 1;
      transform: none;
      transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                  transform 0.65s cubic-bezier(0.22,1,0.36,1);
    }

    /* Stagger children */
    .scroll-stagger > * {
      opacity: 0;
      transform: translateY(28px);
      will-change: transform, opacity;
    }
    .scroll-stagger.in > *:nth-child(1)  { transition-delay: 0.04s; }
    .scroll-stagger.in > *:nth-child(2)  { transition-delay: 0.10s; }
    .scroll-stagger.in > *:nth-child(3)  { transition-delay: 0.16s; }
    .scroll-stagger.in > *:nth-child(4)  { transition-delay: 0.22s; }
    .scroll-stagger.in > *:nth-child(5)  { transition-delay: 0.28s; }
    .scroll-stagger.in > *:nth-child(6)  { transition-delay: 0.34s; }
    .scroll-stagger.in > * {
      opacity: 1;
      transform: none;
      transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1),
                  transform 0.55s cubic-bezier(0.22,1,0.36,1);
    }

    /* Parallax container */
    .parallax-slow { transition: transform 0.1s linear; }
  `
  document.head.appendChild(style)

  const selectors = '.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, .scroll-scale, .scroll-stagger'

  function observe() {
    const els = document.querySelectorAll(selectors)
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    els.forEach(el => obs.observe(el))
    return obs
  }

  let obs = observe()

  const mutObs = new MutationObserver(() => {
    obs.disconnect()
    obs = observe()
  })
  mutObs.observe(document.body, { childList: true, subtree: true })

  function handleParallax() {
    const scrollY = window.scrollY
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3
      el.style.transform = `translateY(${scrollY * speed}px)`
    })
  }
  window.addEventListener('scroll', handleParallax, { passive: true })
}

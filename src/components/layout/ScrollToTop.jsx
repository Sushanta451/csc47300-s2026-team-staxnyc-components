import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset scroll position on route change (keeps page transitions, fixes profile opening mid-page). */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * Plays a pixel "level-load" wipe over the viewport on every route change —
 * a scan bar sweeps down over the incoming page, matching the game's zone
 * transitions. The curtain is a pure CSS animation retriggered per pathname.
 *
 * Skipped entirely under reduced-motion, and on the very first mount (the
 * game loading screen already owns that reveal).
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const curtainRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (firstRender.current) {
      firstRender.current = false
      return
    }

    const curtain = curtainRef.current
    if (!curtain) return

    // Retrigger the CSS animation: remove, force reflow, re-add.
    curtain.classList.remove('route-curtain-run')
    void curtain.offsetWidth
    curtain.classList.add('route-curtain-run')
  }, [location.pathname])

  return (
    <>
      {children}
      <div ref={curtainRef} aria-hidden className="route-curtain" />
    </>
  )
}

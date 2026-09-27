import { useEffect } from 'react'
import { useAchievements } from './AchievementsProvider'
import { EXPLORABLE } from '../../data/site'

/**
 * Registers every zone as "visited" once its section scrolls into view.
 * Drives the HUD map meter and the EXPLORER achievement. Sections just need
 * their existing `id` to match a NAV_ITEMS id.
 *
 * Several zones are lazy-loaded (Projects, Certificates, GitHub), so their
 * DOM nodes don't exist at first paint. A MutationObserver keeps watching and
 * attaches the IntersectionObserver to each zone as it mounts.
 */
export function useZoneTracking() {
  const { visit } = useAchievements()

  useEffect(() => {
    const observed = new Set<Element>()

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visit(entry.target.id as never)
            io.unobserve(entry.target)
            observed.delete(entry.target)
          }
        })
      },
      { threshold: 0.35 },
    )

    const scan = () => {
      EXPLORABLE.forEach(id => {
        const el = document.getElementById(id)
        if (el && !observed.has(el)) {
          observed.add(el)
          io.observe(el)
        }
      })
    }

    scan()

    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [visit])
}

export default useZoneTracking

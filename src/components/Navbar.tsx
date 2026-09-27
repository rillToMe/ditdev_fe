import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import PixelIcon from './systems/PixelIcon'
import NavIcon from './systems/NavIcon'
import { useAchievements } from './systems/AchievementsProvider'
import { NAV_ITEMS } from '../data/site'
import type { SectionId } from '../data/site'
import { EASE } from '../lib/motion'

/**
 * Top bar = the world map legend. Each nav entry is a numbered waypoint on a
 * rail; waypoints light up once the player has actually visited that zone.
 * Sits above the HUD status strip.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<SectionId>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const { visited } = useAchievements()
  const reduced = useReducedMotion()

  useEffect(() => {
    // Section offsets are read from the layout only when they can actually
    // change (mount / resize), never inside the scroll handler. Reading
    // `offsetTop` per item on every scroll tick forces the browser to flush
    // pending style+layout — that was the "Forced reflow" insight.
    const ids = NAV_ITEMS.map(i => i.id)
    let tops: { id: SectionId; top: number }[] = []

    const measure = () => {
      tops = ids
        .map(id => {
          const el = document.getElementById(id)
          return el ? { id, top: el.offsetTop } : null
        })
        .filter((t): t is { id: SectionId; top: number } => t !== null)
    }

    // Coalesce bursts of scroll events into one layout pass per frame.
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      setScrolled(y > 40)
      for (let i = tops.length - 1; i >= 0; i--) {
        if (y >= tops[i].top - 140) {
          setActive(tops[i].id)
          break
        }
      }
    }

    const handleScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const handleResize = () => {
      measure()
      if (!raf) raf = requestAnimationFrame(update)
    }

    measure()
    update()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleNav = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE.snap }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b ${
          scrolled
            ? 'bg-bg-primary/92 backdrop-blur-md border-pixel-blue/12'
            : 'bg-gradient-to-b from-bg-primary/80 to-transparent border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo / player tag */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 group shrink-0"
            aria-label="Back to top"
          >
            <div className="w-8 h-8 relative">
              <div
                className="absolute inset-0 bg-pixel-blue/20 border border-pixel-blue/50 group-hover:bg-pixel-blue/35 transition-colors"
                style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-pixel text-pixel-blue text-[10px]">
                RA
              </span>
            </div>
            <span className="font-mono text-pixel-white/80 text-sm group-hover:text-pixel-blue transition-colors hidden sm:inline">
              <span className="text-pixel-blue">@</span>adit
            </span>
          </button>

          {/* Desktop nav — glyph + label; the active item carries a sliding underline */}
          <ul className="hidden md:flex items-center gap-0.5 relative">
            {NAV_ITEMS.map(item => {
              const isActive = active === item.id
              const isVisited = visited.has(item.id)
              return (
                <li key={item.id}>
                  <motion.button
                    onClick={() => handleNav(item.id)}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    whileFocus="hover"
                    className={`relative flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
                      isActive
                        ? 'text-pixel-cyan'
                        : isVisited
                          ? 'text-pixel-gray/70 hover:text-pixel-white'
                          : 'text-pixel-gray/40 hover:text-pixel-gray/80'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-pixel-cyan' : isVisited ? 'text-pixel-blue/60' : 'text-pixel-gray/30'
                      }`}
                    >
                      <NavIcon name={item.icon} active={isActive} reduced={!!reduced} />
                    </span>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-2.5 right-2.5 -bottom-0.5 h-px bg-pixel-cyan"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </motion.button>
                </li>
              )
            })}
          </ul>

          {/* Mobile toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close map' : 'Open map'}
              aria-expanded={menuOpen}
            >
              <span className={`block w-5 h-0.5 bg-pixel-blue transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-pixel-blue transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-pixel-blue transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile map panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2, ease: EASE.snap }}
            className="fixed top-14 left-0 right-0 z-40 bg-bg-primary/97 backdrop-blur-lg border-b border-pixel-blue/20 md:hidden"
          >
            <ul className="flex flex-col p-3 gap-1">
              {NAV_ITEMS.map(item => {
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <motion.button
                      onClick={() => handleNav(item.id)}
                      initial="rest"
                      animate="rest"
                      whileHover="hover"
                      whileTap="hover"
                      className={`w-full flex items-center gap-3 text-left px-3 py-2.5 font-mono text-sm border transition-colors ${
                        isActive
                          ? 'text-pixel-cyan border-pixel-cyan/30 bg-pixel-cyan/8'
                          : 'text-pixel-gray hover:text-pixel-white border-transparent hover:border-pixel-blue/20'
                      }`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span className={isActive ? 'text-pixel-cyan' : 'text-pixel-blue/50'}>
                        <NavIcon name={item.icon} active={isActive} reduced={!!reduced} />
                      </span>
                      <span>{item.label}</span>
                      {isActive && <PixelIcon name="check" size={11} className="ml-auto text-pixel-cyan/60" />}
                    </motion.button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

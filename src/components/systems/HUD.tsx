import { motion } from 'framer-motion'
import PixelIcon from './PixelIcon'
import CountUp from './CountUp'
import { useAchievements } from './AchievementsProvider'
import { SITE } from '../../data/site'
import { EASE } from '../../lib/motion'

interface HUDProps {
  onOpenConsole: () => void
}

/** Persistent status bar: player chip, XP, map %, badges, console toggle. */
export default function HUD({ onOpenConsole }: HUDProps) {
  const { xp, mapProgress, unlockedCount, total } = useAchievements()
  const pct = Math.round(mapProgress * 100)

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE.snap, delay: 0.1 }}
      className="fixed top-[57px] left-0 right-0 z-40 pointer-events-none"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="pointer-events-auto flex items-center gap-2 sm:gap-4 h-8 px-3 sm:px-4 border border-pixel-blue/15 border-t-0 bg-bg-primary/85 backdrop-blur-md"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 6px))' }}
        >
          {/* Traveler chip — the visitor whose XP/MAP/badges this bar tracks */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
            <span className="font-pixel text-[8px] text-pixel-white/90">{SITE.traveler}</span>
          </div>

          <span className="w-px h-4 bg-pixel-blue/15 hidden sm:block" />

          {/* XP */}
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-[220px]">
            <span className="font-pixel text-[8px] text-yellow-400/90 shrink-0 hidden sm:inline">XP</span>
            <div className="relative flex-1 h-2 bg-bg-hover border border-yellow-400/15 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-600 to-yellow-300"
                style={{ width: `${Math.min((xp % 1000) / 10, 100)}%` }}
              />
            </div>
            <motion.span
              key={xp}
              initial={{ opacity: 0.4, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-pixel text-[8px] text-yellow-400/90 shrink-0 tabular-nums"
            >
              <CountUp value={xp} duration={700} />
            </motion.span>
          </div>

          <span className="w-px h-4 bg-pixel-blue/15 hidden md:block" />

          {/* Map % */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <PixelIcon name="map" size={11} className="text-pixel-cyan/70" />
            <span className="font-mono text-[10px] text-pixel-gray/60">MAP</span>
            <span className="font-pixel text-[8px] text-pixel-cyan tabular-nums">{pct}%</span>
          </div>

          <span className="w-px h-4 bg-pixel-blue/15 hidden md:block" />

          {/* Badges */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <PixelIcon name="trophy" size={11} className="text-yellow-400/80" />
            <span className="font-pixel text-[8px] text-yellow-400/90 tabular-nums">{unlockedCount}/{total}</span>
          </div>

          {/* Console toggle */}
          <button
            onClick={onOpenConsole}
            className="ml-auto shrink-0 flex items-center gap-1.5 px-2 py-1 border border-pixel-cyan/25 text-pixel-cyan/80 hover:text-pixel-cyan hover:border-pixel-cyan/60 hover:bg-pixel-cyan/5 transition-colors"
            aria-label="Open developer console"
            title="Open developer console (~)"
          >
            <PixelIcon name="terminal" size={11} />
            <span className="font-pixel text-[8px] hidden sm:inline">CONSOLE</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

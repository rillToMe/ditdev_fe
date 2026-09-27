import { motion, AnimatePresence } from 'framer-motion'
import { useAchievements } from './AchievementsProvider'

/** Quiet, low-key achievement notices. A slim mono chip — no glow, no box,
 *  no bounce — so unlocks register without crowding the screen. */
export default function AchievementToast() {
  const { toasts, dismissToast } = useAchievements()

  return (
    <div className="fixed top-20 right-4 z-[9990] flex flex-col items-end gap-1.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.button
            key={t.id}
            type="button"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-bg-primary/80 backdrop-blur-sm max-w-[240px]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          >
            <span className="w-1 h-1 shrink-0 bg-pixel-cyan/70" aria-hidden />
            <span className="font-mono text-[11px] text-pixel-white/90 truncate">{t.title}</span>
            <span className="font-mono text-[10px] text-pixel-gray/40 shrink-0 tabular-nums">+{t.xp}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}

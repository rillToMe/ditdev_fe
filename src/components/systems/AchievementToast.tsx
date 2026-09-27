import { motion, AnimatePresence } from 'framer-motion'
import PixelIcon from './PixelIcon'
import { useAchievements } from './AchievementsProvider'
import { scalePop, EASE } from '../../lib/motion'

/** Stacked "ACHIEVEMENT UNLOCKED" toasts, top-right. */
export default function AchievementToast() {
  const { toasts, dismissToast } = useAchievements()

  return (
    <div className="fixed top-20 right-4 z-[9990] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.button
            key={t.id}
            type="button"
            variants={scalePop}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto text-left px-4 py-3 border border-yellow-400/40 bg-bg-primary/95 backdrop-blur-sm max-w-[260px]"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              boxShadow: '0 0 24px rgba(255,215,0,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <PixelIcon name="trophy" size={14} className="text-yellow-400 shrink-0" />
              <span className="font-pixel text-[9px] text-yellow-400 tracking-widest">UNLOCKED</span>
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ease: EASE.snap }}
                className="ml-auto font-pixel text-[9px] text-yellow-300"
              >
                +{t.xp}
              </motion.span>
            </div>
            <p className="font-pixel text-[10px] text-pixel-white leading-relaxed">{t.title}</p>
            <p className="font-mono text-[10px] text-pixel-gray/50 mt-0.5">{t.hint}</p>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}

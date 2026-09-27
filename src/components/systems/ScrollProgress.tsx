import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion'

/**
 * Cinematic scroll rail pinned to the very top of the page — reads as a
 * quest-completion bar for the whole realm. A thin track with a glowing
 * fill + a leading "playhead" spark that trails the fill slightly, so the
 * bar feels driven by a game engine rather than a CSS width transition.
 *
 * Scroll position is smoothed through a spring, which is what gives it the
 * weighty, cinematic lag instead of snapping 1:1 to the wheel.
 */
export default function ScrollProgress() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.4,
    restDelta: 0.0005,
  })

  // Trailing spark lags the fill just a touch → sense of momentum.
  const spark = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    mass: 0.5,
    restDelta: 0.0005,
  })

  const fillWidth = useTransform(progress, v => `${Math.min(Math.max(v, 0), 1) * 100}%`)
  const sparkLeft = useTransform(spark, v => `${Math.min(Math.max(v, 0), 1) * 100}%`)

  // The rail only becomes visible once the player actually starts descending.
  const opacity = useTransform(scrollYProgress, [0, 0.012, 0.04], [0, 0, 1])

  if (reduced) return null

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="fixed top-0 left-0 right-0 z-[9991] h-[3px] pointer-events-none"
    >
      {/* Track */}
      <div className="absolute inset-0 bg-pixel-blue/10" />

      {/* Fill */}
      <motion.div
        style={{ width: fillWidth }}
        className="absolute inset-y-0 left-0 origin-left"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pixel-blue via-pixel-cyan to-pixel-purple" />
        {/* leading glow edge */}
        <div className="absolute inset-y-0 right-0 w-6 translate-x-1/2 bg-gradient-to-r from-transparent via-pixel-cyan/70 to-transparent blur-[2px]" />
      </motion.div>

      {/* Trailing spark — a small pixel diamond that rides the playhead */}
      <motion.div style={{ left: sparkLeft }} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2">
        <span className="block w-1.5 h-1.5 rotate-45 bg-pixel-cyan shadow-[0_0_8px_2px_rgba(0,212,255,0.8)]" />
      </motion.div>

      {/* Scanline shimmer across the whole rail */}
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: 'repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.08) 6px 7px)' }}
      />
    </motion.div>
  )
}

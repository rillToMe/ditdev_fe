import { motion } from 'framer-motion'
// Deep imports (allowed — pixelarticons ships no `exports` map) so the dev
// server prebundles only the eight glyphs we actually use, instead of the
// full 1036-icon `pixelarticons/react` barrel (~1.4 MB).
import { BookOpen } from 'pixelarticons/react/BookOpen'
import { Chart }    from 'pixelarticons/react/Chart'
import { Gamepad }  from 'pixelarticons/react/Gamepad'
import { Home }     from 'pixelarticons/react/Home'
import { Mail }     from 'pixelarticons/react/Mail'
import { Star }     from 'pixelarticons/react/Star'
import { Trophy }   from 'pixelarticons/react/Trophy'
import { User }     from 'pixelarticons/react/User'
import { EASE } from '../../lib/motion'

/**
 * Nav waypoint glyph, backed by the MIT-licensed `pixelarticons` set so the
 * whole bar speaks one real pixel-art language (24×24 viewBox, `currentColor`,
 * `shapeRendering: crispEdges` — no blurring when scaled).
 *
 * Two nested layers keep the motion states from fighting each other:
 *  - outer → hover/focus hop, driven by variant propagation from the button
 *  - inner → slow idle bob, only while its section is the active one, so
 *            exactly one glyph breathes at rest and the bar stays calm
 * Both are suppressed under prefers-reduced-motion (the colour shift remains).
 */
const GLYPHS = {
  home:     Home,
  user:     User,
  gamepad:  Gamepad,
  trophy:   Trophy,
  star:     Star,
  book:     BookOpen,
  chart:    Chart,
  mail:     Mail,
} as const

export type NavIconName = keyof typeof GLYPHS

interface NavIconProps {
  name: NavIconName
  active: boolean
  reduced: boolean
}

export default function NavIcon({ name, active, reduced }: NavIconProps) {
  const Glyph = GLYPHS[name]
  const idle = !reduced && active

  return (
    <motion.span
      className="relative inline-flex"
      variants={{
        rest:  { y: 0, scale: 1 },
        hover: { y: [0, -3, 0], scale: [1, 1.18, 1] },
      }}
      transition={{ duration: 0.45, ease: EASE.snap }}
    >
      <motion.span
        className="inline-flex"
        animate={idle ? { y: [0, -1.5, 0] } : { y: 0 }}
        transition={idle
          ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.2 }}
      >
        <Glyph width={14} height={14} shapeRendering="crispEdges" aria-hidden />
      </motion.span>
    </motion.span>
  )
}

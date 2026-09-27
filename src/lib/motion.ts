import type { Variants } from 'framer-motion'

type Bezier = [number, number, number, number]

/** Central easing curves. */
export const EASE: Record<'snap' | 'smooth' | 'inOut' | 'back', Bezier> = {
  snap:   [0.16, 1, 0.3, 1],
  smooth: [0.4, 0, 0.2, 1],
  inOut:  [0.65, 0, 0.35, 1],
  back:   [0.34, 1.56, 0.64, 1],
}

export const DUR = {
  instant: 0.12,
  base: 0.24,
  slow: 0.48,
  cinematic: 0.8,
} as const

/* ── Spring presets ───────────────────────────────────────────────────
   Beziers are precise but read as "CSS". These springs carry momentum —
   the overshoot and settle that make game UI feel physical. Use `SPRING`
   for entrances that should arrive with weight, `SPRING_SOFT` for hovers
   and layout shifts that must not overshoot. */
export const SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 22,
  mass: 0.9,
} as const

export const SPRING_SOFT = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.7,
} as const

/** Bouncy, for badges/trophies that should pop in and wobble. */
export const SPRING_BOUNCE = {
  type: 'spring',
  stiffness: 420,
  damping: 14,
  mass: 0.8,
} as const

/* ── Entrance archetypes ──────────────────────────────────────────────
   Four distinct motions instead of one repeated fade-up.
   Every section picks the archetype that fits its content. */

/** 1. Pixel-assemble — chunky rise + blur clear. HUD, titles, headings. */
export const assemble: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DUR.slow, ease: EASE.snap },
  },
}

/** 2. Slide-in — direction aware. Timeline, feeds, side panels. */
export const slideIn = (dir: 'left' | 'right' = 'left', distance = 28): Variants => ({
  hidden: { opacity: 0, x: dir === 'left' ? -distance : distance },
  show: { opacity: 1, x: 0, transition: { duration: DUR.slow, ease: EASE.snap } },
})

/** 3. Scale-pop — springy overshoot. Badges, achievements, trophies. */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.82 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.slow, ease: EASE.back } },
}

/** 4. Scan — clip reveal from the left. Dialog, terminal, console. */
export const scan: Variants = {
  hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  show: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: DUR.slow, ease: EASE.smooth },
  },
}

/** Section "level load" wipe — used sparingly, at most once per zone. */
export const wipe: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0.6 },
  show: {
    clipPath: 'inset(0 0 0% 0)',
    opacity: 1,
    transition: { duration: DUR.cinematic, ease: EASE.snap },
  },
}

/** 5. Depth — cinematic push-in from the back of the scene. Hero, modals,
 *  any element that should feel like it is rushing toward the player. */
export const depth: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 24, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: SPRING,
  },
}

/** 6. Flip-in — a card rotating up on its X axis. Dossiers, credential cards. */
export const flipIn: Variants = {
  hidden: { opacity: 0, rotateX: -55, y: 30, transformPerspective: 900 },
  show: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transformPerspective: 900,
    transition: SPRING,
  },
}

/** 7. Rise — heavy, weighty lift. For elements that should land, not float. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
}

/** Parent container that staggers its children. */
export const stagger = (each = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren: delay } },
})

/** Shared viewport config for whileInView reveals. */
export const VIEWPORT = { once: true, amount: 0.2 } as const

/** Same, but fires a little earlier — for tall sections and card grids. */
export const VIEWPORT_EARLY = { once: true, amount: 0.12 } as const

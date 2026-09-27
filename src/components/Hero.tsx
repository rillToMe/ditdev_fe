import { useCallback, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import PixelIcon from './systems/PixelIcon'
import PixelButton from './systems/PixelButton'
import ScrambleText from './systems/ScrambleText'
import { SOCIALS, SITE } from '../data/site'
import useTypewriter from '../hooks/useTypewriter'
import { useInViewport } from './systems/useInViewport'
import { useMotionActive } from '../hooks/useMotionGuard'
import { DUR, EASE, stagger, assemble } from '../lib/motion'

const ROLES = [
  'Game Developer',
  'Web Enthusiast',
  'Unity Programmer',
  'Indie Creator',
  'C# Programmer',
]

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  blinkSpeed: number
  blinkDir: number
  color: string
  drift: number
}

/** Title screen: parallax starfield, player plate, menu-style actions. */
export default function Hero({ play = true }: { play?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const typed = useTypewriter(ROLES, 80, 40, 1800)
  const { ref: viewRef, inView } = useInViewport<HTMLElement>({ rootMargin: '0px' })
  const motionActive = useMotionActive()
  const reduced = useReducedMotion()

  // ── Scroll-driven depth: as the title screen leaves, the content sinks
  //    and blurs while the starfield keeps drifting — a "flying away" feel.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
  const contentY = useTransform(smooth, [0, 1], [0, 140])
  const contentOpacity = useTransform(smooth, [0, 0.65, 1], [1, 0.35, 0])
  const contentScale = useTransform(smooth, [0, 1], [1, 0.94])
  const contentBlur = useTransform(smooth, [0, 1], ['blur(0px)', 'blur(6px)'])
  const glowY = useTransform(smooth, [0, 1], [0, -180])
  const promptOpacity = useTransform(smooth, [0, 0.2], [1, 0])

  // Starfield — paused when the title screen scrolls away, the tab is hidden,
  // or the player prefers reduced motion.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView || !motionActive) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let width = 0
    let height = 0
    const stars: Star[] = []
    const parallax = { x: 0, y: 0, tx: 0, ty: 0 }

    const makeStar = (): Star => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      blinkSpeed: Math.random() * 0.01 + 0.003,
      blinkDir: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.8 ? '#00d4ff' : '#4f8cff',
      drift: Math.random() * 0.05 + 0.015,
    })

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    resize()
    for (let i = 0; i < 110; i++) stars.push(makeStar())

    const onMove = (e: MouseEvent) => {
      parallax.tx = (e.clientX / window.innerWidth - 0.5) * 18
      parallax.ty = (e.clientY / window.innerHeight - 0.5) * 18
    }

    const animate = () => {
      parallax.x += (parallax.tx - parallax.x) * 0.05
      parallax.y += (parallax.ty - parallax.y) * 0.05
      ctx.clearRect(0, 0, width, height)

      for (const s of stars) {
        s.opacity += s.blinkSpeed * s.blinkDir
        if (s.opacity > 0.85 || s.opacity < 0.05) s.blinkDir *= -1
        s.y -= s.drift
        if (s.y < -2) { s.y = height + 2; s.x = Math.random() * width }

        ctx.globalAlpha = s.opacity
        ctx.fillStyle = s.color
        ctx.fillRect(s.x + parallax.x, s.y + parallax.y, s.size, s.size)
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [inView, motionActive])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // Both the scroll-progress target and the viewport observer need the section.
  // useCallback keeps the ref identity stable so React doesn't detach/reattach
  // it (and re-measure useScroll) on every render.
  const setRefs = useCallback((el: HTMLElement | null) => {
    sectionRef.current = el
    viewRef.current = el
  }, [viewRef])

  return (
    <section
      id="home"
      ref={setRefs}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 grid-faint opacity-70 pointer-events-none" />
      <motion.div
        style={reduced ? undefined : { y: glowY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full pointer-events-none"
      >
        <div
          className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,140,255,0.07) 0%, rgba(0,212,255,0.03) 42%, transparent 70%)' }}
        />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity, scale: contentScale, filter: contentBlur }}
        variants={stagger(0.11, 0.15)}
        initial="hidden"
        animate={play ? 'show' : 'hidden'}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-10"
      >
        {/* Save-slot header */}
        <motion.div variants={assemble} className="inline-flex items-center gap-2.5 mb-7">
          <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
          <span className="font-pixel text-[9px] tracking-[0.28em] text-green-400/90">
            SAVE SLOT 01 · ONLINE
          </span>
        </motion.div>

        {/* Name plate */}
        <motion.div variants={assemble}>
          <p className="font-mono text-pixel-cyan/80 text-xs tracking-[0.35em] mb-4">
            {'// '}{SITE.owner}
          </p>
          <h1 className="font-pixel leading-[1.35] mb-3">
            <span className="block text-3xl sm:text-5xl lg:text-6xl text-pixel-white">
              <ScrambleText text={SITE.firstName} speed={55} play={play} />
            </span>
            <span className="block text-3xl sm:text-5xl lg:text-6xl gradient-text">
              <ScrambleText text={SITE.lastName} speed={55} delay={220} play={play} />
            </span>
          </h1>
        </motion.div>

        {/* Class / role typewriter */}
        <motion.div
          variants={assemble}
          className="mt-6 mb-3 h-8 flex items-center justify-center"
        >
          <span className="font-mono text-pixel-gray text-base sm:text-lg">
            <span className="text-pixel-blue mr-2">&gt;</span>
            <span className="text-pixel-white">{typed}</span>
            <span className="inline-block w-0.5 h-5 bg-pixel-cyan ml-0.5 animate-blink" />
          </span>
        </motion.div>

        <motion.p variants={assemble} className="flex items-center justify-center gap-2 mb-10 font-mono text-pixel-gray/70 text-sm">
          <PixelIcon name="pin" size={13} className="text-pixel-blue" />
          {SITE.location}
        </motion.p>

        {/* Menu actions */}
        <motion.div
          variants={assemble}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          <PixelButton variant="primary" cursor icon="sword" onClick={() => scrollTo('projects')}>
            VIEW QUESTS
          </PixelButton>
          <PixelButton variant="ghost" cursor icon="mail" onClick={() => scrollTo('contact')}>
            CONTACT
          </PixelButton>
          <PixelButton variant="ghost" cursor icon="download" href="/cv.pdf" title="Download CV">
            DOWNLOAD CV
          </PixelButton>
        </motion.div>

        {/* Party links */}
        <motion.div variants={assemble} className="flex items-center justify-center gap-4">
          {SOCIALS.map(s => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="group flex items-center gap-2 px-3 py-2 border border-pixel-blue/20 text-pixel-gray hover:text-pixel-cyan hover:border-pixel-cyan/50 hover:bg-pixel-cyan/5 transition-colors font-mono text-xs"
              style={{ clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}
            >
              <span className="w-1.5 h-1.5 bg-pixel-blue/50 group-hover:bg-pixel-cyan transition-colors" />
              {s.label}
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* Press-to-scroll prompt — entrance delay on the inner button, scroll
          fade-out on the outer wrapper (two opacity sources must not collide). */}
      <motion.div
        style={reduced ? undefined : { opacity: promptOpacity }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.button
          onClick={() => scrollTo('about')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: DUR.slow, ease: EASE.snap }}
          className="flex flex-col items-center gap-2 group"
          aria-label="Scroll to About"
        >
          <span className="font-pixel text-pixel-gray/40 group-hover:text-pixel-cyan/70 text-[8px] tracking-widest transition-colors">
            PRESS ▼ TO START
          </span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PixelIcon name="chevronDown" size={14} className="text-pixel-blue/50 group-hover:text-pixel-cyan transition-colors" />
          </motion.div>
        </motion.button>
      </motion.div>
    </section>
  )
}

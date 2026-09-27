import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SITE } from '../data/site'
import { useMotionActive } from '../hooks/useMotionGuard'
import ScrambleText from './systems/ScrambleText'
import catSprite from '../assets/footer_parallax/cat/cat_walk.png'

const FRAME_WIDTH  = 32
const FRAME_HEIGHT = 32
const TOTAL_FRAMES = 32
const FPS          = 14
const SCALE        = 3

/** Deterministic seed shown in the telemetry readout. */
const SEED = '0x' + SITE.version.replace(/\D/g, '').slice(0, 3).padStart(4, '0').toUpperCase()

/** Narrative flavour line, advanced by progress thresholds. */
const MESSAGE_STEPS = [
  { at: 0,  text: 'Cat is inspecting the world' },
  { at: 14, text: 'Compiling quests and adventures' },
  { at: 30, text: "Loading Rahmat's skill tree" },
  { at: 46, text: 'Fetching items from the dungeon' },
  { at: 60, text: 'Warming up the game engine' },
  { at: 72, text: 'Spawning NPCs into the realm' },
  { at: 84, text: 'Polishing pixel art' },
  { at: 93, text: 'Almost there, traveler' },
] as const

/** System boot log, revealed as progress crosses each threshold. */
const BOOT_LINES = [
  { at: 4,  label: 'KERNEL',   text: 'realm.core mounted' },
  { at: 16, label: 'RENDER',   text: 'pixel pipeline online' },
  { at: 28, label: 'ASSETS',   text: 'sprites + tilesets cached' },
  { at: 40, label: 'QUESTS',   text: 'project index compiled' },
  { at: 54, label: 'SKILLS',   text: 'constellation graph built' },
  { at: 68, label: 'NPCS',     text: 'CHANGLI-AI summoned' },
  { at: 82, label: 'NETWORK',  text: 'github activity synced' },
  { at: 94, label: 'FINALIZE', text: 'portal stabilised' },
] as const

const TIPS = [
  "TIP // Check out the Projects section to see Rahmat's completed quests.",
  'TIP // Talk to CHANGLI-AI for a guided tour of this realm.',
  'TIP // Rahmat specializes in Unity, Godot, and React.',
  'TIP // Located in Sumatera Barat, Indonesia.',
  'TIP // Available for freelance and collaborations.',
  'TIP // The knight in the footer never tires. True dedication.',
] as const

/** Progress ramp — uneven steps read as real work rather than a metronome. */
const PROGRESS_STEPS = [
  { to: 18,  delay: 16 },
  { to: 42,  delay: 16 },
  { to: 63,  delay: 16 },
  { to: 81,  delay: 16 },
  { to: 94,  delay: 26 },
  { to: 100, delay: 16 },
]

interface GameLoadingScreenProps {
  onComplete?: () => void
}

/** Arcade keycap chip for the start gate's control hints. */
function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-1.5 py-[2px] border border-pixel-blue/25 bg-white/[0.04] text-pixel-gray/60 text-[9px] leading-none tracking-widest">
      {children}
    </span>
  )
}

export default function GameLoadingScreen({ onComplete }: GameLoadingScreenProps) {
  const bgRef        = useRef<HTMLCanvasElement>(null)
  const catRef       = useRef<HTMLCanvasElement>(null)
  const frameRef     = useRef(0)
  const lastTimeRef  = useRef(0)
  const motionActive = useMotionActive()
  const reduced      = useReducedMotion()

  const [progress, setProgress] = useState(0)
  const [fadeOut,  setFadeOut]  = useState(false)
  const [dots,     setDots]     = useState('')
  const [ready,    setReady]    = useState(false)
  const [started,  setStarted]  = useState(false)
  const [showSkip, setShowSkip] = useState(false)
  const [fps,      setFps]      = useState(60)
  const [mem,      setMem]      = useState(18.4)
  const doneRef = useRef(false)

  // Idempotent completion — safe to call from the timer, a click or a key.
  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setFadeOut(true)
    window.setTimeout(() => onComplete?.(), 320)
  }, [onComplete])

  // Skip affordance appears shortly after the gate opens, so an impatient
  // traveller isn't trapped by the intro.
  useEffect(() => {
    const id = window.setTimeout(() => setShowSkip(true), 1400)
    return () => window.clearTimeout(id)
  }, [])

  // Keyboard: once ready, any of Enter/Space/Escape enters the realm; before
  // that, Escape still lets you bail out.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isGo = e.key === 'Enter' || e.key === 'Escape' || e.key === ' '
      if (ready && isGo) {
        e.preventDefault()
        setStarted(true)
        finish()
      } else if (!ready && e.key === 'Escape') {
        e.preventDefault()
        finish()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, finish])

  const handleStart = useCallback(() => {
    setStarted(true)
    finish()
  }, [finish])

  const handleSkip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    finish()
  }, [finish])

  // Lock scroll while the gate is visible
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Starfield / shooting-star backdrop ────────────────────────────────
  useEffect(() => {
    const canvas = bgRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const count = Math.min(150, Math.max(40, Math.round((W * H) / 12000)))
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: 0.3 + Math.random() * 0.7,     // depth → size, speed and brightness
      tw: Math.random() * Math.PI * 2,  // twinkle phase
    }))

    let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null
    let raf = 0

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      for (const s of stars) {
        if (motionActive) {
          s.y += s.z * 0.35
          s.tw += 0.06
          if (s.y > H) { s.y = -2; s.x = Math.random() * W }
        }
        const a = 0.2 + 0.6 * s.z * (0.55 + 0.45 * Math.sin(s.tw))
        const size = s.z > 0.8 ? 2 : 1
        ctx.fillStyle = `rgba(150,190,255,${a.toFixed(3)})`
        ctx.fillRect(s.x | 0, s.y | 0, size, size)
      }

      if (motionActive) {
        if (!shoot && Math.random() < 0.007) {
          shoot = {
            x: Math.random() * W * 0.7,
            y: -10,
            vx: 3 + Math.random() * 2.5,
            vy: 2 + Math.random() * 2,
            life: 1,
          }
        }
        if (shoot) {
          shoot.x += shoot.vx
          shoot.y += shoot.vy
          shoot.life -= 0.012
          ctx.strokeStyle = `rgba(0,212,255,${Math.max(shoot.life, 0).toFixed(3)})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(shoot.x, shoot.y)
          ctx.lineTo(shoot.x - shoot.vx * 6, shoot.y - shoot.vy * 6)
          ctx.stroke()
          if (shoot.life <= 0 || shoot.x > W + 20 || shoot.y > H + 20) shoot = null
        }
        raf = requestAnimationFrame(draw)
      }
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [motionActive])

  // ── Cat sprite walk cycle ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = catRef.current
    if (!canvas) return
    const spriteCtx = canvas.getContext('2d')
    if (!spriteCtx) return

    const canvasW = FRAME_WIDTH  * SCALE
    const canvasH = FRAME_HEIGHT * SCALE
    canvas.width  = canvasW
    canvas.height = canvasH
    spriteCtx.imageSmoothingEnabled = false

    const sprite = new Image()
    sprite.src   = catSprite

    const drawFrame = () => {
      spriteCtx.clearRect(0, 0, canvasW, canvasH)
      spriteCtx.imageSmoothingEnabled = false
      spriteCtx.drawImage(
        sprite,
        frameRef.current * FRAME_WIDTH, 0,
        FRAME_WIDTH, FRAME_HEIGHT,
        0, 0,
        canvasW, canvasH,
      )
    }

    // Reduced motion / hidden tab: one static frame, no loop.
    if (!motionActive) {
      if (sprite.complete) drawFrame()
      else sprite.onload = drawFrame
      return
    }

    const interval = 1000 / FPS
    let raf = 0

    const animate = (timestamp: number) => {
      if (!sprite.complete) {
        raf = requestAnimationFrame(animate)
        return
      }
      if (timestamp - lastTimeRef.current >= interval) {
        lastTimeRef.current = timestamp
        drawFrame()
        frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES
      }
      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [motionActive])

  // ── Progress simulation ───────────────────────────────────────────────
  useEffect(() => {
    let current = 0
    let step = 0
    let timer = 0

    const tick = () => {
      if (step >= PROGRESS_STEPS.length) { setReady(true); return }

      const { to, delay } = PROGRESS_STEPS[step]
      if (current < to) {
        current += 1
        setProgress(current)
        timer = window.setTimeout(tick, delay)
      } else {
        step += 1
        timer = window.setTimeout(tick, 60)
      }
    }

    timer = window.setTimeout(tick, 120)
    return () => window.clearTimeout(timer)
  }, [])

  // Blinking dots + telemetry ticker (text only — safe under reduced motion).
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!reduced) setDots(d => (d.length >= 3 ? '' : d + '.'))
      setFps(57 + Math.floor(Math.random() * 4))
      setMem(m => Math.min(m + Math.random() * 0.7, 42))
    }, 400)
    return () => window.clearInterval(id)
  }, [reduced])

  // ── Derived readouts ──────────────────────────────────────────────────
  let message: string = MESSAGE_STEPS[0].text
  for (const m of MESSAGE_STEPS) if (progress >= m.at) message = m.text

  const tip = TIPS[Math.min(Math.floor(progress / 18), TIPS.length - 1)]

  const doneBoot = BOOT_LINES.filter(l => progress >= l.at)
  const nextBoot = BOOT_LINES.find(l => progress < l.at)
  const catWidthPx = FRAME_WIDTH * SCALE

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: '#0a0e1a' }}
      onClick={ready ? handleStart : undefined}
    >
      {/* ── Backdrop layers ── */}
      <canvas ref={bgRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />
      <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 4px)' }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 45%, rgba(79,140,255,0.09) 0%, transparent 70%)' }}
        aria-hidden
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)' }}
        aria-hidden
      />
      {/* Horizon */}
      <div className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(79,140,255,0.10), transparent)' }} />
        <div className="absolute bottom-16 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.35), transparent)' }} />
      </div>

      {/* Rotating reticle behind the content */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-dashed border-pixel-cyan/10 pointer-events-none ${reduced ? '' : 'animate-spin-slow'}`}
        aria-hidden
      />

      {/* Viewport corner brackets */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-pixel-blue/25 pointer-events-none" aria-hidden />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-pixel-blue/25 pointer-events-none" aria-hidden />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-pixel-blue/25 pointer-events-none" aria-hidden />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-pixel-blue/25 pointer-events-none" aria-hidden />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-xl px-8 flex flex-col items-center gap-5">

        {/* Top HUD row */}
        <div className="w-full flex items-center justify-between font-mono text-[9px] text-pixel-gray/35">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 bg-pixel-cyan/70 animate-pulse" />
            SYS.BOOT // GATE_01
          </span>
          <span className="tracking-widest">{SEED}</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="font-pixel text-pixel-cyan text-[9px] tracking-[0.3em] mb-3 opacity-70">
            // LOADING REALM
          </p>
          <h1 className="font-pixel text-pixel-white text-base md:text-lg leading-relaxed">
            <ScrambleText text="Rahmat" play speed={42} />
            <span className="text-pixel-blue">.</span>
            <ScrambleText text="dev" play delay={260} speed={42} />
          </h1>
          <p className="font-mono text-pixel-gray/50 text-xs mt-1.5">
            Game Developer &amp; Web Enthusiast
          </p>
        </div>

        {/* ── Progress + cat ── */}
        <div className="w-full">
          <div className="relative h-12 mb-1">
            <div
              className="absolute bottom-0 transition-all duration-150"
              style={{ left: `clamp(0px, calc(${progress}% - ${catWidthPx / 2}px), calc(100% - ${catWidthPx}px))` }}
            >
              <canvas
                ref={catRef}
                style={{
                  imageRendering: 'pixelated',
                  width : `${catWidthPx}px`,
                  height: `${FRAME_HEIGHT * SCALE}px`,
                  display: 'block',
                }}
              />
              {/* Dust trail */}
              <div className="absolute bottom-1 -left-1.5 flex gap-0.5 pointer-events-none" aria-hidden>
                <span className="w-1 h-1 bg-pixel-cyan/60 load-spark" />
                <span className="w-1 h-1 bg-pixel-blue/50 load-spark" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>

          {/* Milestone ticks */}
          <div className="relative h-2 mb-1">
            {[25, 50, 75].map(p => (
              <div key={p} className="absolute flex flex-col items-center" style={{ left: `${p}%`, transform: 'translateX(-50%)' }}>
                <div className={`w-px h-1.5 ${progress >= p ? 'bg-pixel-cyan/60' : 'bg-pixel-blue/20'}`} />
                <span className={`font-mono text-[7px] mt-0.5 ${progress >= p ? 'text-pixel-cyan/60' : 'text-pixel-gray/20'}`}>{p}</span>
              </div>
            ))}
          </div>

          {/* Bar */}
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Loading realm"
            className="w-full h-4 bg-bg-card/60 border border-pixel-blue/25 relative overflow-hidden"
            style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
          >
            {/* Fill */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-150"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, rgba(79,140,255,0.4), #4f8cff, #00d4ff)' }}
            />
            {/* Shimmer sweep */}
            {!reduced && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-y-0 w-1/4 load-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
              </div>
            )}
            {/* Segment dividers */}
            <div className="absolute inset-0 flex gap-px opacity-30 pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-black/50" />
              ))}
            </div>
            {/* Glow head */}
            <div
              className="absolute inset-y-0 w-4 transition-all duration-150 pointer-events-none"
              style={{ left: `calc(${progress}% - 8px)`, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.7), transparent)' }}
            />
          </div>

          {/* Readout row */}
          <div className="flex items-center justify-between mt-2 font-mono text-[10px]">
            <span className="text-pixel-cyan tabular-nums">
              {String(progress).padStart(3, '0')}%
            </span>
            <span className="hidden sm:flex items-center gap-3 text-pixel-gray/35 tabular-nums">
              <span>FPS {fps}</span>
              <span>MEM {mem.toFixed(1)}MB</span>
              <span>SEED {SEED}</span>
            </span>
            <span className={`font-pixel text-[8px] ${progress >= 100 ? 'text-green-400/80' : 'text-pixel-gray/30'}`}>
              {progress < 100 ? 'LOADING' : ready ? 'READY' : 'FINALIZING'}
            </span>
          </div>
        </div>

        {/* ── Boot console ── */}
        <div
          className="w-full px-3 py-2.5 border border-pixel-blue/15 bg-black/40"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 bg-red-400/50" />
            <span className="w-1.5 h-1.5 bg-yellow-400/50" />
            <span className="w-1.5 h-1.5 bg-green-400/50" />
            <span className="font-mono text-[8px] text-pixel-gray/30 ml-1 tracking-widest">boot.log</span>
          </div>
          <div className="h-[74px] overflow-hidden flex flex-col gap-0.5">
            {doneBoot.slice(-4).map(l => (
              <div key={l.label} className="flex items-center gap-2 font-mono text-[10px] leading-tight">
                <span className="text-green-400/70">[OK]</span>
                <span className="text-pixel-blue/50 w-[62px] shrink-0">{l.label}</span>
                <span className="text-pixel-gray/50 truncate">{l.text}</span>
              </div>
            ))}
            {nextBoot && (
              <div className="flex items-center gap-2 font-mono text-[10px] leading-tight">
                <span className="text-pixel-cyan/80 load-cursor">[▮]</span>
                <span className="text-pixel-cyan/60 w-[62px] shrink-0">{nextBoot.label}</span>
                <span className="text-pixel-gray/40 truncate">{nextBoot.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Narrative message */}
        <div className="text-center min-h-[24px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-pixel-white/75 text-sm"
            >
              {message}<span className="text-pixel-cyan">{dots}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Tip */}
        <div
          className="w-full px-4 py-2.5 border border-pixel-blue/10 bg-pixel-blue/5 relative overflow-hidden"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
        >
          <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-pixel-cyan/50 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.p
              key={tip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-pixel-gray/55 text-xs text-center leading-relaxed"
            >
              {tip}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Skip ── */}
      <AnimatePresence>
        {showSkip && !ready && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute bottom-6 right-6 z-20 font-mono text-[10px] text-pixel-gray/40 hover:text-pixel-cyan border border-pixel-blue/15 hover:border-pixel-cyan/40 px-2.5 py-1 transition-colors"
          >
            SKIP ▸
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── START gate — arcade title-menu prompt ── */}
      <AnimatePresence>
        {ready && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            style={{ background: 'rgba(10,14,26,0.78)' }}
          >
            {/* CRT scanlines carried onto the overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)' }}
              aria-hidden
            />

            <div className="relative flex flex-col items-center gap-4 px-6">
              {/* Section rule */}
              <div className="flex items-center gap-3 w-[260px]">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-pixel-blue/40" />
                <span className="font-mono text-[9px] tracking-[0.4em] text-pixel-cyan/70">SELECT</span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-pixel-blue/40" />
              </div>

              {/* Menu item — the blinking cursor is the only moving part */}
              <button
                type="button"
                onClick={handleStart}
                className="group relative flex items-center gap-3 px-7 py-2.5 outline-none"
                aria-label="Start exploring the realm"
              >
                <span
                  className={`text-pixel-cyan text-sm ${reduced ? '' : 'animate-blink'}`}
                  aria-hidden
                >
                  ▶
                </span>
                <span className="font-pixel text-pixel-white text-sm md:text-base tracking-[0.25em] group-hover:text-pixel-cyan transition-colors">
                  START GAME
                </span>
                {/* Selection bar + frame, revealed on hover/focus */}
                <span
                  className="absolute inset-0 border border-transparent group-hover:border-pixel-cyan/30 group-focus-visible:border-pixel-cyan/30 transition-colors pointer-events-none"
                  aria-hidden
                />
                <span
                  className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-pixel-cyan/50 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none"
                  aria-hidden
                />
              </button>

              {/* Status line */}
              <p className="font-mono text-[11px] h-4 text-pixel-gray/45">
                {started ? (
                  <span className="text-pixel-cyan/80">entering the realm…</span>
                ) : (
                  <>SLOT 01 &nbsp;·&nbsp; 100% COMPLETE</>
                )}
              </p>

              {/* Control hints */}
              <div className="flex items-center gap-2.5 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <Keycap>ENTER</Keycap>
                  <span className="font-mono text-[9px] text-pixel-gray/40">start</span>
                </span>
                <span className="w-px h-3 bg-pixel-blue/20" aria-hidden />
                <span className="flex items-center gap-1.5">
                  <Keycap>CLICK</Keycap>
                  <span className="font-mono text-[9px] text-pixel-gray/40">start</span>
                </span>
                <span className="w-px h-3 bg-pixel-blue/20" aria-hidden />
                <span className="flex items-center gap-1.5">
                  <Keycap>ESC</Keycap>
                  <span className="font-mono text-[9px] text-pixel-gray/40">skip</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom tag */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <p className="font-pixel text-pixel-gray/20 text-[7px] tracking-widest">
          {SITE.version} · GAME ON · SUMATERA BARAT
        </p>
      </div>
    </div>
  )
}

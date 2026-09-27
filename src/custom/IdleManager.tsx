// easter eggs:
// - Konami code: ↑↑↓↓←→←→BA → special response

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PixelIcon from '../components/systems/PixelIcon'
import type { PixelIconName } from '../components/systems/PixelIcon'
import { useAchievements } from '../components/systems/AchievementsProvider'
import { SITE } from '../data/site'
import { EASE } from '../lib/motion'
import avatarImg from '../assets/img/icons/ai_icon.jpg'

const IDLE_TIMEOUT      = 300_000   // 5 minutes of inactivity → AFK overlay
const LONG_IDLE_TIMEOUT = 420_000   // 7 minutes → extended-inactivity mode
const SHAKE_THRESHOLD   = 800

interface IdleMessage {
  title: string
  body: string
  icon: PixelIconName
}

const IDLE_MESSAGES: IdleMessage[] = [
  {
    title: 'Traveler?',
    body : 'You seem to have wandered off.\nThe realm awaits your return.',
    icon : 'star',
  },
  {
    title: 'Still there?',
    body : 'The constellation grows dim\nwithout a traveler to guide.',
    icon : 'sparkle',
  },
  {
    title: 'The realm is quiet...',
    body : 'Even the stars have stopped\nblinking. Are you still here?',
    icon : 'star',
  },
  {
    title: 'Quest paused.',
    body : "Your journey through Rahmat's\nportfolio has been suspended.",
    icon : 'scroll',
  },
  {
    title: 'I am watching.',
    body : 'CHANGLI-AI never sleeps.\nBut you seem to have.',
    icon : 'terminal',
  },
]

const LONG_IDLE_MESSAGES: IdleMessage[] = [
  {
    title: 'HELLO??',
    body : 'It has been a while, traveler.\nAre you lost in another realm?',
    icon : 'info',
  },
  {
    title: 'System alert.',
    body : 'Inactivity detected for a while now.\nThe guardian grows impatient.',
    icon : 'skull',
  },
]

const WAKEUP_MESSAGES = [
  'Welcome back, traveler.',
  'The realm lives again.',
  'Quest resumed.',
  'Good, you have returned.',
  'I knew you would come back.',
]

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

function Firefly() {
  const startX = Math.random() * 100
  const startY = Math.random() * 100
  const size   = 2 + Math.random() * 3
  const dur    = 6 + Math.random() * 8
  const delay  = Math.random() * 4
  const color  = ['#00d4ff','#4f8cff','#ffd700','#a29bfe','#55efc4'][Math.floor(Math.random() * 5)]

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 ${size * 3}px ${color}`, left: `${startX}%`, top: `${startY}%` }}
      animate={{
        x      : [0, (Math.random()-0.5)*200, (Math.random()-0.5)*150, 0],
        y      : [0, (Math.random()-0.5)*150, (Math.random()-0.5)*200, 0],
        opacity: [0, 0.8, 0.6, 0.9, 0],
        scale  : [0, 1, 1.3, 0.8, 0],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/** mm:ss (or h:mm:ss past an hour) — the pause menu's session clock. */
function formatClock(total: number) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/** Types a line out once, restarting whenever `text` changes. */
function useTypedText(text: string, speed = 24) {
  const [n, setN] = useState(0)
  useEffect(() => { setN(0) }, [text])
  useEffect(() => {
    if (n >= text.length) return
    const id = window.setTimeout(() => setN(v => v + 1), speed)
    return () => window.clearTimeout(id)
  }, [n, text, speed])
  return text.slice(0, n)
}

function MenuRow({ icon, label, hint, onClick, active = false }: {
  icon: PixelIconName
  label: string
  hint: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.12 }}
      className="group w-full flex items-center gap-3 px-3 py-2.5 border border-pixel-blue/10 hover:border-pixel-cyan/40 hover:bg-pixel-cyan/5 transition-colors text-left"
      style={{ clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}
    >
      <span className={`font-mono text-pixel-cyan text-xs w-3 ${active ? 'animate-blink' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>▶</span>
      <PixelIcon name={icon} size={12} className={active ? 'text-pixel-cyan' : 'text-pixel-blue/70'} />
      <span className="font-pixel text-[10px] text-pixel-white/90 tracking-wider">{label}</span>
      <span className="ml-auto font-mono text-[10px] text-pixel-gray/40 hidden sm:inline">{hint}</span>
    </motion.button>
  )
}

function StatCell({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-[#04070d] px-3 py-2.5">
      <p className="font-mono text-[9px] text-pixel-gray/40 tracking-widest mb-1">{label}</p>
      <p className={`font-pixel text-[11px] tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}

interface AFKOverlayProps {
  isIdle: boolean
  isLongIdle: boolean
  onWake: () => void
  konamiActive: boolean
}

function AFKOverlay({ isIdle, isLongIdle, onWake, konamiActive }: AFKOverlayProps) {
  const { xp, unlockedCount, total, mapProgress } = useAchievements()
  const [msgIndex, setMsgIndex] = useState(0)
  const [secs,     setSecs]     = useState(0)
  const [wakeMsg,  setWakeMsg]  = useState<string | null>(null)
  const [showWake, setShowWake] = useState(false)

  // Rotate Changli's line while the player is away.
  useEffect(() => {
    if (!isIdle) return
    setMsgIndex(Math.floor(Math.random() * IDLE_MESSAGES.length))
    const id = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % IDLE_MESSAGES.length)
    }, 15_000)
    return () => clearInterval(id)
  }, [isIdle])

  // Live idle clock — resets the moment the player wakes.
  useEffect(() => {
    if (!isIdle) { setSecs(0); return }
    setSecs(0)
    const id = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [isIdle])

  const handleWake = useCallback(() => {
    const msg = WAKEUP_MESSAGES[Math.floor(Math.random() * WAKEUP_MESSAGES.length)]
    setWakeMsg(msg)
    setShowWake(true)
    setTimeout(() => { setShowWake(false); onWake() }, 1800)
  }, [onWake])

  const pool    = isLongIdle ? LONG_IDLE_MESSAGES : IDLE_MESSAGES
  const current = pool[msgIndex % pool.length]
  const typed   = useTypedText(current.body)

  const fireflies = Array.from({ length: 18 }, (_, i) => i)
  const clock  = formatClock(secs)
  const mapPct = Math.round(mapProgress * 100)

  const returnTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    handleWake()
  }

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          key="afk-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9998] cursor-pointer overflow-hidden"
          onClick={handleWake}
          style={{ background: 'rgba(5, 7, 15, 0.9)', backdropFilter: 'blur(3px)' }}
        >
          {/* Fireflies */}
          {fireflies.map(id => <Firefly key={id} />)}

          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.18]"
            style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.5) 3px, rgba(0,0,0,0.5) 4px)' }} />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

          {/* Top status strip — echoes the persistent HUD */}
          <div className="absolute top-0 inset-x-0 h-9 flex items-center gap-3 px-4 sm:px-6 border-b border-pixel-blue/15 bg-black/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
            <span className="font-pixel text-[8px] text-pixel-white/90">{SITE.player}</span>
            <span className="font-mono text-[10px] text-pixel-blue/80">{SITE.handle}</span>
            <span className="hidden sm:block w-px h-4 bg-pixel-blue/15" />
            <span className="font-pixel text-[8px] text-pixel-cyan tracking-widest">AFK MODE</span>
            <span className="ml-auto font-mono text-[10px] text-pixel-gray/40">{SITE.version}</span>
          </div>

          {/* Center: the pause window */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0,  opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE.snap }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-xl"
            >
              {/* Corner brackets on the two square corners */}
              <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-pixel-cyan/40 pointer-events-none" />
              <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-pixel-cyan/40 pointer-events-none" />

              <div
                className="border border-pixel-cyan/25"
                style={{
                  background : 'rgba(4,7,13,0.97)',
                  clipPath   : 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                  boxShadow  : '0 0 60px rgba(0,212,255,0.08)',
                }}
              >
                {/* Title bar — same chrome as the console / zone windows */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-pixel-cyan/15">
                  <span className="w-2 h-2 bg-red-400/60" />
                  <span className="w-2 h-2 bg-yellow-400/60" />
                  <span className="w-2 h-2 bg-green-400/60" />
                  <span className="font-mono text-[11px] text-pixel-gray/40 ml-2">afk.zone</span>
                  <span className="ml-auto font-pixel text-[9px] text-pixel-cyan/70 tracking-widest">PAUSED</span>
                </div>

                <div className="px-5 sm:px-6 py-6 space-y-5">

                  {/* Header */}
                  <div>
                    <p className="font-pixel text-[9px] text-pixel-cyan/50 tracking-[0.25em] mb-2">
                      // SESSION SUSPENDED
                    </p>
                    <h2 className="font-pixel text-pixel-white text-base sm:text-lg leading-relaxed">
                      Realm <span className="gradient-text">Paused</span>
                    </h2>
                    <p className="font-mono text-pixel-gray/50 text-xs mt-2">
                      You stepped away, traveler. The realm held its breath.
                    </p>
                  </div>

                  {/* Changli dialogue box */}
                  <div className="flex items-start gap-3">
                    <div
                      className="relative w-12 h-12 shrink-0 border border-pixel-cyan/40 overflow-hidden"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
                    >
                      <img
                        src={avatarImg}
                        alt="Changli"
                        className="w-full h-full object-cover object-top"
                        style={{ filter: 'saturate(0.85) brightness(0.9) contrast(1.05)' }}
                      />
                      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,212,255,0.06)' }} />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-[#04070d]" />
                    </div>

                    <div
                      className="flex-1 min-w-0 border border-pixel-blue/15 bg-bg-card/25 px-4 py-3"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-pixel text-[8px] text-pixel-cyan tracking-widest">CHANGLI-AI</span>
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                        <span className="font-mono text-[9px] text-green-400/80">ONLINE</span>
                      </div>
                      <p className="font-pixel text-[10px] text-pixel-white/90 mb-1.5">{current.title}</p>
                      <p className="font-mono text-[11px] text-pixel-gray/70 leading-relaxed min-h-[2.5rem] whitespace-pre-line">
                        {typed}
                        <span className="inline-block w-0.5 h-3.5 bg-pixel-cyan/70 ml-0.5 align-middle animate-blink" />
                      </p>
                    </div>
                  </div>

                  {/* Session readout — real state, not invented */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-pixel-blue/10 border border-pixel-blue/10">
                    <StatCell label="IDLE TIME" value={clock}                 accent="text-pixel-cyan" />
                    <StatCell label="XP"        value={xp}                    accent="text-yellow-400" />
                    <StatCell label="BADGES"    value={`${unlockedCount}/${total}`} accent="text-yellow-400" />
                    <StatCell label="MAP"       value={`${mapPct}%`}          accent="text-pixel-cyan" />
                  </div>

                  {/* Extended-inactivity warning */}
                  <AnimatePresence>
                    {isLongIdle && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="flex items-center gap-2 font-mono text-[10px] text-red-400/80">
                          <PixelIcon name="skull" size={11} />
                          EXTENDED INACTIVITY — the guardian is losing patience.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Menu */}
                  <div className="space-y-1.5 pt-1">
                    <MenuRow icon="bolt"       label="RESUME QUEST"  hint="any key"  active onClick={handleWake} />
                    <MenuRow icon="arrowLeft"  label="RETURN TO TOP" hint="scroll up"         onClick={returnTop} />
                  </div>

                  {/* Hint */}
                  <p className="text-center font-pixel text-[9px] text-pixel-blue/60 tracking-widest animate-blink">
                    [ PRESS ANY KEY TO CONTINUE ]
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Konami easter egg */}
          <AnimatePresence>
            {konamiActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 text-center"
              >
                <p className="font-pixel text-yellow-400 text-sm tracking-widest">KONAMI CODE ACTIVATED</p>
                <p className="font-mono text-yellow-400/60 text-xs mt-1">+99 RESPECT POINTS</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wake flash */}
          <AnimatePresence>
            {showWake && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center"
                style={{ background: 'rgba(5,7,15,0.7)' }}
              >
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  className="font-pixel text-pixel-cyan text-base tracking-widest"
                >
                  {wakeMsg}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner tag */}
          <div className="absolute bottom-4 right-4 font-pixel text-pixel-blue/15 text-[8px] tracking-widest">
            AFK MODE · CHANGLI-AI ACTIVE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function IdleManager({ children }: { children: ReactNode }) {
  const [isIdle,       setIsIdle]       = useState(false)
  const [isLongIdle,   setIsLongIdle]   = useState(false)
  const [konamiActive, setKonamiActive] = useState(false)
  const [shakeAlert,   setShakeAlert]   = useState(false)

  const idleTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const konamiSeq     = useRef<string[]>([])
  const lastMousePos  = useRef({ x: 0, y: 0, t: 0 })
  const shakeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (longIdleTimer.current) clearTimeout(longIdleTimer.current)
    setIsLongIdle(false)

    idleTimer.current = setTimeout(() => {
      setIsIdle(true)
      longIdleTimer.current = setTimeout(() => setIsLongIdle(true), LONG_IDLE_TIMEOUT - IDLE_TIMEOUT)
    }, IDLE_TIMEOUT)
  }, [])

  const handleWake = useCallback(() => {
    setIsIdle(false)
    setIsLongIdle(false)
    setKonamiActive(false)
    resetIdle()
  }, [resetIdle])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now()
    const dx  = e.clientX - lastMousePos.current.x
    const dy  = e.clientY - lastMousePos.current.y
    const dt  = now - lastMousePos.current.t || 1
    const speed = Math.sqrt(dx*dx + dy*dy) / dt * 1000

    lastMousePos.current = { x: e.clientX, y: e.clientY, t: now }

    if (speed > SHAKE_THRESHOLD && !isIdle) {
      if (shakeTimer.current) clearTimeout(shakeTimer.current)
      setShakeAlert(true)
      shakeTimer.current = setTimeout(() => setShakeAlert(false), 1500)
    }

    resetIdle()
  }, [isIdle, resetIdle])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isIdle) { handleWake(); return }

    resetIdle()

    konamiSeq.current = [...konamiSeq.current, e.key].slice(-KONAMI.length)
    if (konamiSeq.current.join(',') === KONAMI.join(',')) {
      setKonamiActive(true)
      setIsIdle(true)
      konamiSeq.current = []
    }
  }, [isIdle, handleWake, resetIdle])

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousedown', 'touchstart', 'scroll', 'click']

    const onActivity = () => { if (!isIdle) resetIdle() }

    window.addEventListener('mousemove',  handleMouseMove)
    window.addEventListener('keydown',    handleKeyDown)
    events.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }))

    resetIdle()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown',   handleKeyDown)
      events.forEach(ev => window.removeEventListener(ev, onActivity))
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (longIdleTimer.current) clearTimeout(longIdleTimer.current)
      if (shakeTimer.current) clearTimeout(shakeTimer.current)
    }
  }, [handleMouseMove, handleKeyDown, resetIdle, isIdle])

  return (
    <>
      {children}

      {/* AFK Overlay */}
      <AFKOverlay
        isIdle={isIdle}
        isLongIdle={isLongIdle}
        onWake={handleWake}
        konamiActive={konamiActive}
      />

      {/* Mouse shake alert */}
      <AnimatePresence>
        {shakeAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[9997] pointer-events-none"
          >
            {/* <div
              className="px-4 py-2"
              style={{
                background: 'rgba(10,14,26,0.95)',
                border    : '1px solid rgba(79,140,255,0.25)',
                clipPath  : 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
              }}
            >
              <p className="font-pixel text-pixel-cyan text-[9px] tracking-widest whitespace-nowrap">
                ⚡ Easy there, traveler.
              </p>
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

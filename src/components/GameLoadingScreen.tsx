import { useEffect, useRef, useState } from 'react'
import catSprite from '../assets/footer_parallax/cat/cat_walk.png'

const FRAME_WIDTH  = 32
const FRAME_HEIGHT = 32
const TOTAL_FRAMES = 32
const FPS          = 14
const SCALE        = 3

const LOADING_MESSAGES = [
  'Cat is inspecting the world...',
  'Compiling quests and adventures...',
  "Loading Rahmat's skill tree...",
  'Fetching items from the dungeon...',
  'Warming up the game engine...',
  'Cat found a bug. Fixing it...',
  'Spawning NPCs into the realm...',
  'Synchronizing with the server...',
  'Polishing pixel art...',
  'Almost there, traveler...',
  'Cat refuses to hurry. Please wait...',
  'Initializing CHANGLI-AI systems...',
]

const TIPS = [
  "💡 Tip: Check out the Projects section to see Rahmat's completed quests.",
  '💡 Tip: Talk to CHANGLI-AI for a guided tour of this realm.',
  '💡 Tip: Rahmat specializes in Unity, Godot, and React.',
  '💡 Tip: Located in Sumatera Barat, Indonesia.',
  '💡 Tip: Available for freelance and collaborations.',
  '💡 Tip: The knight in the footer never tires. True dedication.',
]

interface GameLoadingScreenProps {
  onComplete?: () => void
}

export default function GameLoadingScreen({ onComplete }: GameLoadingScreenProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const animRef      = useRef(0)
  const frameRef     = useRef(0)
  const lastTimeRef  = useRef(0)

  const [progress,  setProgress]  = useState(0)
  const [message,   setMessage]   = useState(LOADING_MESSAGES[0])
  const [tip,       setTip]       = useState(TIPS[0])
  const [fadeOut,   setFadeOut]   = useState(false)
  const [dots,      setDots]      = useState('')

  // Lock scroll while loading screen is visible
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Sprite animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width  = FRAME_WIDTH  * SCALE
    canvas.height = FRAME_HEIGHT * SCALE
    ctx.imageSmoothingEnabled = false

    const sprite = new Image()
    sprite.src   = catSprite

    const interval = 1000 / FPS

    const animate = (timestamp: number) => {
      if (!sprite.complete) {
        animRef.current = requestAnimationFrame(animate)
        return
      }
      if (timestamp - lastTimeRef.current >= interval) {
        lastTimeRef.current = timestamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(
          sprite,
          frameRef.current * FRAME_WIDTH, 0,
          FRAME_WIDTH, FRAME_HEIGHT,
          0, 0,
          FRAME_WIDTH * SCALE,
          FRAME_HEIGHT * SCALE
        )
        frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES
      }
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // Progress simulation
  useEffect(() => {
    let current  = 0
    let msgIndex = 0
    let tipIndex = 0

    const progressSteps = [
      { target: 20,  delay: 18 },
      { target: 50,  delay: 18 },
      { target: 80,  delay: 18 },
      { target: 100, delay: 18 },
    ]

    let stepIndex = 0

    const tick = () => {
      if (stepIndex >= progressSteps.length) return

      const { target, delay } = progressSteps[stepIndex]

      if (current < target) {
        current = Math.min(current + 1, target)
        setProgress(current)

        // Update message every ~12%
        if (current % 12 === 0) {
          msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length
          setMessage(LOADING_MESSAGES[msgIndex])
        }

        // Update tip every ~20%
        if (current % 20 === 0) {
          tipIndex = (tipIndex + 1) % TIPS.length
          setTip(TIPS[tipIndex])
        }

        setTimeout(tick, delay)
      } else {
        stepIndex++
        if (stepIndex < progressSteps.length) {
          setTimeout(tick, 50)
        } else {
          setTimeout(() => {
            setFadeOut(true)
            setTimeout(() => onComplete?.(), 300)
          }, 150)
        }
      }
    }

    setTimeout(tick, 100)
  }, [onComplete])

  // Blinking dots
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 400)
    return () => clearInterval(id)
  }, [])

  // Sync Cat X position with progress
  const catWidthPx    = FRAME_WIDTH * SCALE // px visual

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: '#0a0e1a' }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,140,255,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center gap-6">

        {/* Title */}
        <div className="text-center mb-2">
          <p className="font-pixel text-pixel-cyan text-[9px] tracking-[0.3em] mb-3 opacity-60">
            // LOADING REALM
          </p>
          <h1 className="font-pixel text-pixel-white text-sm md:text-base leading-relaxed">
            Rahmat<span className="text-pixel-blue">.</span>dev
          </h1>
          <p className="font-mono text-pixel-gray/50 text-xs mt-1">
            Game Developer & Web Enthusiast
          </p>
        </div>

        {/* PROGRESS BAR + CAT */}
        <div className="w-full">
          {/* Cat sitting on top of progress */}
          <div className="relative h-12 mb-1">
            <div
              className="absolute bottom-0 transition-all duration-150"
              style={{
                left: `clamp(0px, calc(${progress}% - ${catWidthPx / 2}px), calc(100% - ${catWidthPx}px))`,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  imageRendering: 'pixelated',
                  width : `${FRAME_WIDTH  * SCALE}px`,
                  height: `${FRAME_HEIGHT * SCALE}px`,
                  display: 'block',
                }}
              />
            </div>
          </div>

          {/* Bar container */}
          <div
            className="w-full h-4 bg-bg-card/60 border border-pixel-blue/25 relative overflow-hidden"
            style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
          >
            {/* Fill */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-150"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #4f8cff66, #4f8cff, #00d4ff)',
              }}
            />

            {/* Pixel segments overlay */}
            <div className="absolute inset-0 flex gap-px opacity-30">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-black/50" />
              ))}
            </div>

            {/* Glow pulse on fill edge */}
            <div
              className="absolute inset-y-0 w-4 transition-all duration-150"
              style={{
                left: `calc(${progress}% - 8px)`,
                background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)',
              }}
            />
          </div>

          {/* Progress text */}
          <div className="flex items-center justify-between mt-2">
            <p className="font-mono text-pixel-blue/60 text-xs">
              {progress < 100 ? `${progress}%` : '100% ✓'}
            </p>
            <p className="font-pixel text-pixel-gray/30 text-[8px]">
              {progress < 100 ? 'LOADING' : 'READY'}
            </p>
          </div>
        </div>

        {/* Loading message */}
        <div className="text-center min-h-[24px]">
          <p className="font-mono text-pixel-white/70 text-sm">
            {message}<span className="text-pixel-cyan">{dots}</span>
          </p>
        </div>

        {/* Tip */}
        <div
          className="w-full px-4 py-2.5 border border-pixel-blue/10 bg-pixel-blue/5"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
        >
          <p className="font-mono text-pixel-gray/50 text-xs text-center leading-relaxed">
            {tip}
          </p>
        </div>

        {/* Decorative corner tags */}
        <div className="absolute top-0 left-0 font-pixel text-pixel-blue/15 text-[8px]">◢</div>
        <div className="absolute top-0 right-0 font-pixel text-pixel-blue/15 text-[8px]">◣</div>
        <div className="absolute bottom-0 left-0 font-pixel text-pixel-blue/15 text-[8px]">◥</div>
        <div className="absolute bottom-0 right-0 font-pixel text-pixel-blue/15 text-[8px]">◤</div>

      </div>

      {/* Bottom tag */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <p className="font-pixel text-pixel-gray/20 text-[7px] tracking-widest">
          v2.0.0 · GAME ON · SUMATERA BARAT
        </p>
      </div>
    </div>
  )
}
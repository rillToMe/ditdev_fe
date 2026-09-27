import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SiUnity, SiGodotengine, SiUnrealengine, SiBlender,
  SiReact, SiJavascript, SiHtml5, SiPostgresql,
  SiTypescript, SiRust, SiBun, SiGithub,
} from 'react-icons/si'
import { DiVisualstudio } from 'react-icons/di'
import { BiLogoVisualStudio } from 'react-icons/bi'
import { TbBrandCSharp } from 'react-icons/tb'
import type { IconType } from 'react-icons'

import ZoneHeader from './systems/ZoneHeader'
import PixelIcon from './systems/PixelIcon'
import { useAchievements } from './systems/AchievementsProvider'
import { useInViewport } from './systems/useInViewport'
import { DUR, EASE } from '../lib/motion'

type Tier = 'legendary' | 'advanced' | 'intermediate' | 'apprentice'

interface SkillNode {
  id: string
  label: string
  icon: IconType
  category: string
  x: number
  y: number
  tier: Tier
  connects: string[]
}

/* Laid out as the real Orion constellation: head (Meissa), two shoulders
   (Betelgeuse / Bellatrix), the three-star belt, the hanging sword, the
   two feet (Saiph / Rigel) and the shield arc. Edges follow Orion's actual
   line pattern, so the links read as a constellation — not a spider web.
   GitHub sits on the shield and is a hub: everything you build ends up
   pushed there, so it draws more links than any other star. */
const SKILLS: SkillNode[] = [
  // head
  { id: 'csharp',     label: 'C#',            icon: TbBrandCSharp,      category: 'language', x: 0.50, y: 0.09, tier: 'legendary',    connects: ['unity','javascript','github'] },
  // shoulders
  { id: 'unity',      label: 'Unity',         icon: SiUnity,            category: 'gamedev',  x: 0.33, y: 0.24, tier: 'legendary',    connects: ['csharp','react'] },
  { id: 'javascript', label: 'JavaScript',    icon: SiJavascript,       category: 'language', x: 0.67, y: 0.22, tier: 'advanced',     connects: ['csharp','bun','vs','typescript','github'] },
  { id: 'typescript', label: 'TypeScript',    icon: SiTypescript,       category: 'language', x: 0.75, y: 0.13, tier: 'advanced',     connects: ['javascript','bun','github'] },
  // belt
  { id: 'react',      label: 'React',         icon: SiReact,            category: 'web',      x: 0.45, y: 0.50, tier: 'advanced',     connects: ['unity','html','postgresql','github'] },
  { id: 'html',       label: 'HTML/CSS',      icon: SiHtml5,            category: 'web',      x: 0.53, y: 0.47, tier: 'legendary',    connects: ['react','bun','godot'] },
  { id: 'bun',        label: 'Bun',           icon: SiBun,              category: 'tools',    x: 0.61, y: 0.44, tier: 'advanced',     connects: ['javascript','typescript','html','vscode','github'] },
  // sword
  { id: 'godot',      label: 'Godot',         icon: SiGodotengine,      category: 'gamedev',  x: 0.52, y: 0.58, tier: 'advanced',     connects: ['html','unreal'] },
  { id: 'unreal',     label: 'Unreal Engine', icon: SiUnrealengine,     category: 'gamedev',  x: 0.53, y: 0.66, tier: 'apprentice',   connects: ['godot','blender'] },
  { id: 'blender',    label: 'Blender',       icon: SiBlender,          category: 'design',   x: 0.54, y: 0.74, tier: 'advanced',     connects: ['unreal'] },
  // feet
  { id: 'postgresql', label: 'PostgreSQL',    icon: SiPostgresql,       category: 'database', x: 0.40, y: 0.80, tier: 'intermediate', connects: ['react','rust'] },
  { id: 'rust',       label: 'Rust',          icon: SiRust,             category: 'language', x: 0.29, y: 0.62, tier: 'intermediate', connects: ['postgresql','github'] },
  { id: 'vscode',     label: 'VS Code',       icon: BiLogoVisualStudio, category: 'tools',    x: 0.72, y: 0.82, tier: 'legendary',    connects: ['bun','github'] },
  // shield arc
  { id: 'vs',         label: 'Visual Studio', icon: DiVisualstudio,     category: 'tools',    x: 0.80, y: 0.30, tier: 'legendary',    connects: ['javascript','github'] },
  { id: 'github',     label: 'GitHub',        icon: SiGithub,           category: 'tools',    x: 0.87, y: 0.50, tier: 'legendary',    connects: ['vs','javascript','typescript','csharp','rust','bun','react','vscode'] },
]

const CATEGORIES = [
  { id: 'all',      label: 'All Stars' },
  { id: 'gamedev',  label: 'Game Dev'  },
  { id: 'language', label: 'Language'  },
  { id: 'web',      label: 'Web'       },
  { id: 'design',   label: 'Design'    },
  { id: 'database', label: 'Database'  },
  { id: 'tools',    label: 'Tools'     },
]

/* Rank drives the star colour + core size, matching the legend exactly.
   Stars get a soft halo because that is what a star *is* — not a neon
   glow pasted onto a card. */
const TIER_CONFIG: Record<Tier, { color: string; label: string; size: number; pips: number }> = {
  legendary:    { color: '#ffd700', label: 'Legendary',    size: 3.4, pips: 4 },
  advanced:     { color: '#00d4ff', label: 'Advanced',     size: 2.8, pips: 3 },
  intermediate: { color: '#4f8cff', label: 'Intermediate', size: 2.3, pips: 2 },
  apprentice:   { color: '#8b9cc8', label: 'Apprentice',   size: 1.9, pips: 1 },
}

const CATEGORY_COLORS: Record<string, string> = {
  gamedev : '#ff6b6b',
  language: '#ffd700',
  web     : '#00d4ff',
  design  : '#ff9f43',
  database: '#a29bfe',
  tools   : '#55efc4',
}

const hexA = (hex: string, a: number) =>
  `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`

/* deterministic hash → 0..1, for an even, non-repeating starfield */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* ── Study log: honest, still-learning notes — deliberately no XP total
   or badge scoreboard, which read as bragging for a beginner portfolio.
   Stage tags reuse the constellation's tier vocabulary so the copy stays
   truthful (no invented progress percentages). ─────────────────────── */
const FOCUS = [
  { label: 'Unity · C#',          field: 'Game Dev', stage: 'Practicing' },
  { label: 'React · TypeScript',  field: 'Web',      stage: 'Learning'   },
  { label: 'Godot',               field: 'Game Dev', stage: 'Exploring'  },
  { label: 'Backend · Rust',      field: 'Server',   stage: 'Exploring'  },
]

const STAGE_COLOR: Record<string, string> = {
  Practicing: '#00d4ff',
  Learning:   '#4f8cff',
  Exploring:  '#8b9cc8',
}

function StudyLog() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: DUR.slow, ease: EASE.snap }}
      className="mt-8 p-5 border border-pixel-blue/15 bg-bg-card/20 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="flex items-center gap-2 font-pixel text-pixel-cyan text-xs">
            <PixelIcon name="scroll" size={13} />
            STUDY LOG
          </p>
          <p className="font-mono text-pixel-gray/40 text-[10px] mt-1.5 max-w-xs leading-relaxed">
            What I'm learning right now — no finish line, just progress.
          </p>
        </div>
        <span className="shrink-0 font-mono text-[9px] px-2 py-1 border border-pixel-cyan/25 text-pixel-cyan/70">
          IN PROGRESS
        </span>
      </div>

      <div className="space-y-2.5">
        {FOCUS.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <PixelIcon name="chevronRight" size={9} className="text-pixel-gray/40 shrink-0" />
            <span className="font-mono text-pixel-white/80 text-[11px] flex-1 min-w-0 truncate">{item.label}</span>
            <span className="font-mono text-pixel-gray/35 text-[9px] hidden sm:inline shrink-0">{item.field}</span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5" style={{ background: STAGE_COLOR[item.stage] }} />
              <span className="font-mono text-[9px]" style={{ color: STAGE_COLOR[item.stage] }}>{item.stage}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="font-mono text-pixel-gray/45 text-[9px] italic mt-4 leading-relaxed">
        "Still a long way to go — and that's the fun part."
      </p>
    </motion.div>
  )
}

export default function Skills() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef(0)
  const timeRef      = useRef(0)

  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredSkill,   setHoveredSkill]   = useState<string | null>(null)
  const [canvasSize,     setCanvasSize]     = useState({ w: 800, h: 480 })

  const { record } = useAchievements()
  // Pause the canvas loop entirely when the constellation is off screen.
  const { ref: viewRef, inView } = useInViewport<HTMLDivElement>({ rootMargin: '160px' })

  // Inspecting a star counts toward STARGAZER (6 distinct skills).
  const inspected = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (!hoveredSkill) return
    if (inspected.current.has(hoveredSkill)) return
    inspected.current.add(hoveredSkill)
    record('skills_inspected', 6, 'stargazer')
  }, [hoveredSkill, record])

  const getPos    = useCallback((skill: SkillNode, w: number, h: number) => ({ x: skill.x * w, y: skill.y * h }), [])
  const isVisible = useCallback((skill: SkillNode) =>
    activeCategory === 'all' || skill.category === activeCategory,
  [activeCategory])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = canvasSize
    timeRef.current += 0.012
    const t = timeRef.current
    ctx.clearRect(0, 0, w, h)

    /* ── Deep space: a photographic starfield over near-black blue ── */
    ctx.fillStyle = '#111729'
    ctx.fillRect(0, 0, w, h)

    // faint interstellar haze — depth without looking like a painted nebula
    const haze = ctx.createRadialGradient(w * 0.5, h * 0.44, 0, w * 0.5, h * 0.44, Math.max(w, h) * 0.72)
    haze.addColorStop(0,    'rgba(122,104,84,0.045)')
    haze.addColorStop(0.55, 'rgba(92,80,72,0.02)')
    haze.addColorStop(1,    'transparent')
    ctx.fillStyle = haze
    ctx.fillRect(0, 0, w, h)

    /* ── Milky Way galaxy: a broad dusty river of unresolved starlight
       with dark dust lanes, matching the reference photo (the
       Scorpius/Sagittarius core — Kaus Australis, Shaula, Lesath).
       Warm tan glow + dark rifts + a dense star cloud along the band. ── */
    ctx.save()
    ctx.translate(w * 0.52, h * 0.50)
    ctx.rotate(-0.60)
    const bandW = Math.max(w, h) * 1.9
    const bandH = h * 1.15
    const toBand = (bx: number, by: number) => ({
      x: w * 0.52 + bx * Math.cos(-0.60) - by * Math.sin(-0.60),
      y: h * 0.50 + bx * Math.sin(-0.60) + by * Math.cos(-0.60),
    })

    // broad warm glow of unresolved starlight — tan/brown, not blue-white
    const mw = ctx.createLinearGradient(0, -bandH * 0.5, 0, bandH * 0.5)
    mw.addColorStop(0,    'transparent')
    mw.addColorStop(0.24, 'rgba(150,122,88,0.05)')
    mw.addColorStop(0.50, 'rgba(198,168,124,0.16)')
    mw.addColorStop(0.76, 'rgba(150,122,88,0.05)')
    mw.addColorStop(1,    'transparent')
    ctx.fillStyle = mw
    ctx.fillRect(-bandW / 2, -bandH / 2, bandW, bandH)

    // hotter inner core — the galactic bulge, warmest and densest
    const core = ctx.createLinearGradient(0, -bandH * 0.16, 0, bandH * 0.16)
    core.addColorStop(0,   'transparent')
    core.addColorStop(0.5, 'rgba(232,205,158,0.13)')
    core.addColorStop(1,   'transparent')
    ctx.fillStyle = core
    ctx.fillRect(-bandW / 2, -bandH * 0.16, bandW, bandH * 0.32)

    // dark dust lanes cutting through the glow
    for (let i = 0; i < 13; i++) {
      const dx = (i / 12 - 0.5) * bandW * 0.82
      const dy = Math.sin(i * 2.3 + 1.1) * bandH * 0.06
      const dr = bandH * (0.06 + rnd(i * 3.7 + 5.2) * 0.11)
      const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, dr)
      dg.addColorStop(0, `rgba(14,10,8,${0.28 + rnd(i * 1.9) * 0.14})`)
      dg.addColorStop(1, 'transparent')
      ctx.fillStyle = dg
      ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2); ctx.fill()
    }

    // dense star cloud hugging the band — mostly warm tan suns
    for (let i = 0; i < 320; i++) {
      const bx = (rnd(i * 1.37 + 9.1) - 0.5) * bandW * 0.92
      const by = (rnd(i * 2.71 + 3.3) - 0.5) * bandH * 0.34
      const p  = toBand(bx, by)
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) continue
      const tw = 0.30 + rnd(i * 5.3) * 0.45
      const tint = i % 8 === 0 ? '196,214,255'
                 : i % 3 === 0 ? '226,205,168'
                 : '238,214,170'
      ctx.fillStyle = `rgba(${tint},${tw})`
      ctx.fillRect(p.x, p.y, i % 9 === 0 ? 1.5 : 1, i % 9 === 0 ? 1.5 : 1)
    }
    ctx.restore()

    /* ── Starfield: a dense, even field of tiny pixel stars ──────── */
    for (let i = 0; i < 460; i++) {
      const bx = rnd(i * 1.71 + 0.37) * w
      const by = rnd(i * 2.31 + 1.13) * h
      const tw = 0.45 + Math.sin(i * 91.3 + t * 0.22) * 0.25
      const s  = i % 13 === 0 ? 2 : i % 5 === 0 ? 1.5 : 1
      const tint = i % 7 === 0 ? '190,212,255'
                 : i % 7 === 2 ? '255,236,208'
                 : i % 7 === 4 ? '210,228,255'
                 : '232,240,255'
      ctx.fillStyle = `rgba(${tint},${Math.max(0.16, tw)})`
      ctx.fillRect(bx, by, s, s)
    }

    // two tiny open clusters — the little knots of blue stars in the photo
    const CLUSTERS = [
      { x: 0.17, y: 0.63, n: 22, spread: 0.028 },
      { x: 0.71, y: 0.68, n: 18, spread: 0.024 },
    ]
    CLUSTERS.forEach((cl, ci) => {
      const cx = cl.x * w, cy = cl.y * h
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.06)
      gl.addColorStop(0, 'rgba(150,180,240,0.06)')
      gl.addColorStop(1, 'transparent')
      ctx.fillStyle = gl
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.06, 0, Math.PI * 2); ctx.fill()
      for (let j = 0; j < cl.n; j++) {
        const a = rnd(ci * 90 + j * 3.1) * Math.PI * 2
        const rr = Math.sqrt(rnd(ci * 70 + j * 5.7)) * cl.spread * Math.max(w, h)
        const px = cx + Math.cos(a) * rr
        const py = cy + Math.sin(a) * rr * 0.8
        ctx.fillStyle = `rgba(190,212,255,${0.30 + rnd(ci * 30 + j) * 0.35})`
        ctx.fillRect(px, py, 1, 1)
      }
    })

    // a few brighter field stars with soft round halos (like Altair / Enif)
    const FIELD = [
      { x: 0.14, y: 0.30, r: 2.6, c: '200,218,255' },
      { x: 0.86, y: 0.20, r: 2.2, c: '255,222,170' },
      { x: 0.24, y: 0.86, r: 2.4, c: '255,236,200' },
      { x: 0.92, y: 0.62, r: 2.0, c: '210,226,255' },
      { x: 0.07, y: 0.66, r: 2.2, c: '214,228,255' },
      { x: 0.66, y: 0.90, r: 2.0, c: '255,230,190' },
      { x: 0.44, y: 0.05, r: 2.1, c: '205,222,255' },
    ]
    FIELD.forEach((f, i) => {
      const fx = f.x * w, fy = f.y * h
      const fl = 0.75 + Math.sin(t * 0.6 + i * 2.1) * 0.25
      const hg = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r * 4.2)
      hg.addColorStop(0,   `rgba(${f.c},${0.34 * fl})`)
      hg.addColorStop(0.4, `rgba(${f.c},${0.09 * fl})`)
      hg.addColorStop(1,   'transparent')
      ctx.beginPath(); ctx.arc(fx, fy, f.r * 4.2, 0, Math.PI * 2)
      ctx.fillStyle = hg; ctx.fill()
      ctx.beginPath(); ctx.arc(fx, fy, f.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgb(${f.c})`; ctx.fill()
    })

    // vignette — pulls the eye toward the constellation
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.34, w / 2, h / 2, Math.max(w, h) * 0.80)
    vg.addColorStop(0, 'transparent')
    vg.addColorStop(1, 'rgba(2,4,10,0.50)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, w, h)

    /* ── Links: faint constellation lines, brighter near hover ─── */
    const drawn = new Set<string>()
    SKILLS.forEach(skill => {
      if (!isVisible(skill)) return
      skill.connects.forEach(targetId => {
        const key = [skill.id, targetId].sort().join('|')
        if (drawn.has(key)) return
        drawn.add(key)
        const target = SKILLS.find(s => s.id === targetId)
        if (!target || !isVisible(target)) return
        const from  = getPos(skill, w, h)
        const to    = getPos(target, w, h)
        const isHov = hoveredSkill === skill.id || hoveredSkill === targetId
        const hoverCol = hoveredSkill === skill.id ? TIER_CONFIG[skill.tier].color
                       : hoveredSkill === targetId ? TIER_CONFIG[target.tier].color
                       : '#8fb0e8'
        const alpha = isHov ? 0.6 : 0.10 + Math.sin(t + skill.id.length) * 0.02
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = hexA(hoverCol, alpha)
        ctx.lineWidth   = isHov ? 1.1 : 0.6
        ctx.stroke()
        if (isHov) {
          const p  = (Math.sin(t * 2.2) * 0.5 + 0.5)
          const dx = from.x + (to.x - from.x) * p
          const dy = from.y + (to.y - from.y) * p
          ctx.fillStyle = hoverCol
          ctx.fillRect(dx - 1, dy - 1, 2, 2)
        }
      })
    })

    /* ── Stars: glowing cores with a soft halo + cross flare ───── */
    SKILLS.forEach(skill => {
      const visible = isVisible(skill)
      const pos     = getPos(skill, w, h)
      const tier    = TIER_CONFIG[skill.tier]
      const isHov   = hoveredSkill === skill.id
      const pulse   = 1 + Math.sin(t * 1.3 + skill.id.length * 0.8) * 0.16
      const r       = tier.size * (isHov ? 1.9 : 1) * pulse
      const col     = isHov ? '#ffffff' : tier.color

      if (!visible) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 1.4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(90,110,150,0.30)'
        ctx.fill()
        return
      }

      // soft halo — the star's light bleeding into the dark
      const haloR = r * (isHov ? 4.6 : 3.2)
      const halo  = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, haloR)
      halo.addColorStop(0,    hexA(tier.color, isHov ? 0.5 : 0.30))
      halo.addColorStop(0.5,  hexA(tier.color, isHov ? 0.12 : 0.07))
      halo.addColorStop(1,    'transparent')
      ctx.beginPath(); ctx.arc(pos.x, pos.y, haloR, 0, Math.PI * 2)
      ctx.fillStyle = halo; ctx.fill()

      // bright core
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
      ctx.fillStyle = col
      ctx.fill()
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, r * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      // label
      ctx.font      = `${isHov ? 'bold ' : ''}${isHov ? 11 : 10}px "JetBrains Mono", monospace`
      ctx.fillStyle = isHov ? '#ffffff' : 'rgba(175,198,232,0.80)'
      ctx.textAlign = 'center'
      const labelY  = pos.y > h * 0.84 ? pos.y - haloR - 6 : pos.y + haloR + 4
      const text    = isHov ? `✦ ${skill.label}` : skill.label
      ctx.fillText(text, pos.x, labelY)
      if (!isHov) {
        const tw = ctx.measureText(text).width
        ctx.fillStyle = hexA(tier.color, 0.5)
        ctx.fillRect(pos.x - tw / 2 - 8, labelY - 4, 3, 1.5)
      }
    })

    animFrameRef.current = requestAnimationFrame(draw)
  }, [canvasSize, hoveredSkill, isVisible, getPos])

  useEffect(() => {
    if (!inView) return
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [draw, inView])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      const h = Math.min(Math.max(width * 0.56, 300), 520)
      setCanvasSize({ w: Math.floor(width), h: Math.floor(h) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx   = (e.clientX - rect.left) * (canvasSize.w / rect.width)
    const my   = (e.clientY - rect.top)  * (canvasSize.h / rect.height)
    let found: string | null = null
    let minD = Infinity
    SKILLS.forEach(skill => {
      if (!isVisible(skill)) return
      const pos  = getPos(skill, canvasSize.w, canvasSize.h)
      const d    = Math.hypot(mx - pos.x, my - pos.y)
      const tier = TIER_CONFIG[skill.tier]
      if (d < tier.size * 3 + 10 && d < minD) { minD = d; found = skill.id }
    })
    setHoveredSkill(found)
  }, [canvasSize, isVisible, getPos])

  const hovered      = SKILLS.find(s => s.id === hoveredSkill)
  const visibleCount = SKILLS.filter(isVisible).length

  return (
    <section id="skills" className="py-28 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <ZoneHeader
          variant="terminal"
          index="05"
          tag="skills"
          title="Skill"
          accent="Constellation"
          icon="star"
          subtitle="Hover a star to trace its connections across the realm."
        />

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border transition-colors ${
                activeCategory === cat.id
                  ? 'border-pixel-cyan/70 text-pixel-cyan bg-pixel-cyan/10'
                  : 'border-pixel-blue/20 text-pixel-gray/50 hover:border-pixel-blue/50 hover:text-pixel-white/70'
              }`}
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
            >
              {activeCategory === cat.id && <PixelIcon name="dot" size={7} />}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Constellation canvas */}
        <div className="relative" ref={viewRef}>
          <div className="relative border border-pixel-blue/15 bg-black overflow-hidden" ref={containerRef}
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}>
            {['top-0 left-0 border-t-2 border-l-2','top-0 right-4 border-t-2 border-r-2','bottom-4 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
              <div key={i} className={`absolute w-4 h-4 border-pixel-cyan/35 z-10 ${cls}`} />
            ))}

            {/* Chart readouts */}
            <div className="absolute top-2.5 left-4 z-10 pointer-events-none font-mono text-[9px] text-pixel-gray/35">
              ✦ CONSTELLATION
            </div>
            <div className="absolute top-2.5 right-4 z-10 pointer-events-none font-mono text-[9px] text-pixel-gray/35">
              {visibleCount} STARS
            </div>
            <div className="absolute bottom-2.5 left-4 z-10 pointer-events-none font-mono text-[9px] text-pixel-gray/35">
              {hovered ? `✦ ${hovered.label.toUpperCase()} · ${TIER_CONFIG[hovered.tier].label.toUpperCase()}` : '✦ HOVER A STAR'}
            </div>

            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredSkill(null)}
              style={{ width: '100%', height: canvasSize.h, cursor: hoveredSkill ? 'var(--cur-precision), crosshair' : 'var(--cur-normal), default', display: 'block' }}
            />
            <AnimatePresence>
              {hovered && (() => {
                const tier      = TIER_CONFIG[hovered.tier]
                const catColor  = CATEGORY_COLORS[hovered.category] || tier.color
                const Icon      = hovered.icon
                const connected = hovered.connects.map(id => SKILLS.find(s => s.id === id)?.label).filter(Boolean)
                return (
                  <motion.div key={hovered.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-8 left-4 z-20 pointer-events-none"
                  >
                    <div className="bg-bg-primary/96 border border-pixel-blue/25 backdrop-blur-sm min-w-[210px]"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-pixel-blue/15">
                        <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ background: tier.color, boxShadow: `0 0 6px ${hexA(tier.color, 0.7)}` }} />
                        <span className="font-mono text-pixel-gray/40 text-[9px]">STAR</span>
                        <span className="ml-auto font-mono text-[9px]" style={{ color: hexA(catColor, 0.65) }}>{hovered.category.toUpperCase()}</span>
                      </div>
                      <div className="px-3.5 py-3">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div style={{ color: tier.color }} className="text-lg"><Icon /></div>
                          <p className="font-pixel text-pixel-white text-[11px]">{hovered.label}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <span key={i} className="font-mono text-[11px] leading-none"
                                style={{ color: i < tier.pips ? tier.color : 'rgba(136,146,164,0.3)' }}>★</span>
                            ))}
                          </div>
                          <span className="font-mono text-[9px]" style={{ color: tier.color }}>{tier.label}</span>
                        </div>
                        {connected.length > 0 && (
                          <p className="font-mono text-pixel-gray/45 text-[9px] leading-relaxed">connects → {connected.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>
          </div>
        </div>

        {/* Rank legend */}
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 items-center justify-between">
          <span className="font-mono text-pixel-gray/30 text-[9px] tracking-wider">STAR RANK</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {(Object.entries(TIER_CONFIG) as [Tier, typeof TIER_CONFIG[Tier]][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="shrink-0 rounded-full"
                  style={{ width: cfg.size * 2.4, height: cfg.size * 2.4, background: cfg.color, boxShadow: `0 0 ${cfg.size * 2}px ${hexA(cfg.color, 0.5)}` }} />
                <span className="font-mono text-pixel-gray/55 text-[10px]">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        <StudyLog />
      </div>
    </section>
  )
}

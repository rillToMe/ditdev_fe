import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import axios from 'axios'
import type { ReactNode } from 'react'
import { SiUnity, SiGodotengine, SiReact, SiBlender, SiUnrealengine, SiGithub } from 'react-icons/si'
import { DiVisualstudio } from 'react-icons/di'
import { BiLogoVisualStudio } from 'react-icons/bi'
import { TbBrandCSharp } from 'react-icons/tb'

import ZoneHeader from './systems/ZoneHeader'
import PixelIcon from './systems/PixelIcon'
import { SOCIALS, SITE } from '../data/site'
import { assemble, stagger, slideIn, VIEWPORT, DUR, EASE } from '../lib/motion'
import avatarImg from '../assets/img/icons/avatar.jpeg'

type Rarity = 'legendary' | 'advanced' | 'intermediate'

const RARITY: Record<Rarity, { color: string; label: string }> = {
  legendary:    { color: '#ffd700', label: 'Legendary' },
  advanced:     { color: '#00d4ff', label: 'Advanced' },
  intermediate: { color: '#4f8cff', label: 'Intermediate' },
}

interface InventoryItem {
  icon: ReactNode
  name: string
  rarity: Rarity
}

const INVENTORY: InventoryItem[] = [
  { icon: <SiUnity />,            name: 'Unity',         rarity: 'legendary'    },
  { icon: <TbBrandCSharp />,      name: 'C#',            rarity: 'legendary'    },
  { icon: <SiGodotengine />,      name: 'Godot',         rarity: 'advanced'     },
  { icon: <SiReact />,            name: 'React',         rarity: 'advanced'     },
  { icon: <BiLogoVisualStudio />, name: 'VS Code',       rarity: 'legendary'    },
  { icon: <SiBlender />,          name: 'Blender',       rarity: 'advanced'     },
  { icon: <SiUnrealengine />,     name: 'Unreal',        rarity: 'intermediate' },
  { icon: <DiVisualstudio />,     name: 'Visual Studio', rarity: 'advanced'     },
  { icon: <SiGithub />,           name: 'GitHub',        rarity: 'advanced'     },
]

/* ── Attributes ────────────────────────────────────────────────────────
   Bars get their scale + accent from this map, but the LABEL always comes
   from the admin-managed stat (stat.label). We only fall back to these
   labels if the API returns an empty one, so a rename in the admin panel
   is reflected here instead of being silently overwritten. */
interface AttributeMeta { max: number; color: string; label: string }

const ATTRIBUTE_META: Record<string, AttributeMeta> = {
  months_studying:  { max: 36,  color: '#a29bfe', label: 'Months Studying'  },
  experiments_done: { max: 30,  color: '#00d4ff', label: 'Experiments Done' },
  total_projects:   { max: 20,  color: '#4f8cff', label: 'Total Projects'   },
  years_coding:     { max: 6,   color: '#61dafb', label: 'Years Coding'     },
  bugs_fixed:       { max: 200, color: '#ff7675', label: 'Bugs Fixed'      },
  cups_of_coffee:   { max: 1000,color: '#fdcb6e', label: 'Cups of Coffee'  },
}

interface AboutStat { key: string; value: number; label: string }

const FALLBACK_STATS: AboutStat[] = [
  { key: 'months_studying',  value: 20, label: 'Months Studying'  },
  { key: 'experiments_done', value: 11, label: 'Experiments Done' },
  { key: 'total_projects',   value: 6,  label: 'Total Projects'   },
]

function AttributeBar({ stat, index }: { stat: AboutStat; index: number }) {
  const meta  = ATTRIBUTE_META[stat.key] || { max: Math.max(stat.value, 1), color: '#4f8cff', label: stat.label }
  const pct   = Math.max(4, Math.min(stat.value / meta.max, 1) * 100)
  // Admin-managed label wins; ATTRIBUTE_META label is only a fallback.
  const label = stat.label?.trim() || meta.label

  return (
    <motion.div variants={slideIn('right', 20)} className="group">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-mono text-xs text-pixel-gray/70 group-hover:text-pixel-white transition-colors">
          {label}
        </span>
        <span className="font-pixel text-[10px] tabular-nums" style={{ color: meta.color }}>
          {stat.value}
        </span>
      </div>
      <div className="h-2 bg-bg-hover border border-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={VIEWPORT}
          transition={{ duration: DUR.slow, ease: EASE.snap, delay: 0.1 + index * 0.08 }}
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${meta.color}44, ${meta.color})` }}
        />
      </div>
    </motion.div>
  )
}

export default function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 })
  const [stats, setStats] = useState<AboutStat[]>(FALLBACK_STATS)

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || '/api'
    axios.get(`${API}/stats`)
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const clean = (res.data.data as { key: string; value: number | null; label: string }[])
            .filter(s => typeof s.value === 'number' && s.value !== null)
            .map(s => ({ key: s.key, value: s.value as number, label: s.label }))
          if (clean.length) setStats(clean)
        }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  return (
    <section id="about" className="relative py-28 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <ZoneHeader
          variant="side-tag"
          index="02"
          tag="CHARACTER"
          title="Character"
          accent="Sheet"
          icon="shield"
          subtitle="Player profile, attributes and equipped inventory."
        />

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: portrait + lore */}
          <motion.div
            variants={stagger(0.09)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="space-y-6"
          >
            <motion.div variants={assemble} className="flex items-center gap-5">
              <div className="relative w-fit shrink-0">
                <div
                  className="w-28 h-28 border-2 border-pixel-blue/50 relative overflow-hidden bg-bg-primary"
                  style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
                >
                  {avatarImg ? (
                    <>
                      <img src={avatarImg} alt={SITE.name} className="w-full h-full object-cover" />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)' }}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-pixel text-3xl text-pixel-blue opacity-60">RA</span>
                    </div>
                  )}
                </div>
                <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-pixel-cyan/80" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-pixel-blue/80" />
              </div>

              {/* Class plate */}
              <div className="min-w-0">
                <p className="font-pixel text-pixel-white text-sm mb-2 truncate">{SITE.name}</p>
                <dl className="space-y-1 font-mono text-[11px]">
                  <div className="flex gap-2">
                    <dt className="text-pixel-gray/40 w-14 shrink-0">CLASS</dt>
                    <dd className="text-pixel-cyan">Game Developer</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-pixel-gray/40 w-14 shrink-0">GUILD</dt>
                    <dd className="text-pixel-blue">Kyuzen Studio</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-pixel-gray/40 w-14 shrink-0">REALM</dt>
                    <dd className="text-pixel-gray/70">{SITE.location}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>

            <motion.div variants={assemble} className="space-y-4 border-l border-pixel-blue/15 pl-5">
              <p className="font-mono text-pixel-gray/90 leading-relaxed text-sm">
                Hey! I'm <span className="text-pixel-white font-semibold">Adit</span>, a
                <span className="text-pixel-blue"> Game Developer</span> and
                <span className="text-pixel-cyan"> Web Enthusiast</span> from Sumatera Barat, Indonesia.
              </p>
              <p className="font-mono text-pixel-gray/75 leading-relaxed text-sm">
                I craft interactive experiences — from immersive game worlds built with Unity and Godot,
                to modern web applications. Every project is a new quest, every bug a final boss.
              </p>
              <p className="font-mono text-pixel-gray/75 leading-relaxed text-sm">
                Off the clock I explore music through TikTok, write lyrics on Instagram, and study new
                game mechanics for "research" purposes.
              </p>
            </motion.div>

            {/* Party */}
            <motion.div variants={assemble} className="flex flex-wrap items-center gap-2.5 pt-1">
              {SOCIALS.map(s => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border border-pixel-blue/20 text-pixel-gray hover:text-pixel-cyan hover:border-pixel-cyan/50 hover:bg-pixel-cyan/5 transition-colors font-mono text-xs"
                  style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                >
                  <span className="w-1.5 h-1.5 bg-pixel-blue/50" />
                  {s.label}
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: attributes + inventory + snippet */}
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="space-y-8"
          >
            {/* Attributes */}
            <motion.div variants={assemble}>
              <p className="flex items-center gap-2 font-pixel text-[9px] text-pixel-cyan/70 tracking-widest mb-5">
                <PixelIcon name="bolt" size={12} />
                ATTRIBUTE POINTS
              </p>
              <div className="space-y-4">
                {stats.slice(0, 5).map((s, i) => (
                  <AttributeBar key={s.key} stat={s} index={i} />
                ))}
              </div>
            </motion.div>

            {/* Inventory */}
            <motion.div variants={assemble}>
              <p className="flex items-center gap-2 font-pixel text-[9px] text-pixel-cyan/70 tracking-widest mb-4">
                <PixelIcon name="gamepad" size={12} />
                EQUIPPED INVENTORY
              </p>
              <div className="flex flex-wrap gap-2">
                {INVENTORY.map(({ icon, name, rarity }) => {
                  const cfg = RARITY[rarity]
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-2 px-2.5 py-1.5 border bg-bg-card/30 hover:bg-bg-hover/40 transition-colors"
                      style={{ borderColor: `${cfg.color}33` }}
                      title={cfg.label}
                    >
                      <span style={{ color: cfg.color }} className="text-sm">{icon}</span>
                      <span className="font-mono text-xs text-pixel-gray/80">{name}</span>
                      <span className="w-1.5 h-1.5" style={{ background: cfg.color }} aria-hidden />
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Code snippet */}
            <motion.div variants={assemble}>
              <div className="border border-pixel-blue/10 bg-bg-card/30 font-mono text-xs">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-pixel-blue/10">
                  <span className="w-2 h-2 bg-red-400/70" />
                  <span className="w-2 h-2 bg-yellow-400/70" />
                  <span className="w-2 h-2 bg-green-400/70" />
                  <span className="text-pixel-gray/30 ml-2">adit.cs</span>
                </div>
                <div className="p-4 space-y-1 text-[11px]">
                  <p><span className="text-purple-400">class</span> <span className="text-cyan-400">Adit</span> <span className="text-pixel-gray">:</span> <span className="text-yellow-400">Developer</span> {'{'}</p>
                  <p className="pl-4"><span className="text-pixel-blue">string</span> <span className="text-pixel-white">name</span> = <span className="text-green-400">"{SITE.name}"</span>;</p>
                  <p className="pl-4"><span className="text-pixel-blue">string</span> <span className="text-pixel-white">location</span> = <span className="text-green-400">"Sumatera Barat"</span>;</p>
                  <p className="pl-4"><span className="text-pixel-blue">bool</span> <span className="text-pixel-white">openToWork</span> = <span className="text-cyan-400">true</span>;</p>
                  <p className="pl-4"><span className="text-pixel-blue">string[]</span> <span className="text-pixel-white">passion</span> = {'{'}<span className="text-green-400">"Games"</span>, <span className="text-green-400">"Web"</span>, <span className="text-green-400">"Music"</span>{'}'};</p>
                  <p>{'}'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

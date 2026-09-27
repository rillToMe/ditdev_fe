import { useCallback } from 'react'
import { SiGithub, SiTiktok, SiInstagram } from 'react-icons/si'
import type { IconType } from 'react-icons'
import PixelIcon from './systems/PixelIcon'
import { useAchievements } from './systems/AchievementsProvider'
import ParallaxBackground from './footer/ParallaxBackground'
import KnightRunner from './footer/KnightRunner'
import { SITE, SOCIALS, TECH_MARQUEE, NAV_ITEMS } from '../data/site'
import type { SocialId } from '../data/site'
import { useInViewport } from './systems/useInViewport'

/** Real app/brand icons per social — matches the Contact roster. */
const SOCIAL_ICON: Record<SocialId, IconType> = {
  github:    SiGithub,
  tiktok:    SiTiktok,
  instagram: SiInstagram,
}

export default function Footer() {
  const { unlock } = useAchievements()
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: '120px' })

  const handleNav = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const year = new Date().getFullYear()

  // Poke the knight → hidden achievement.
  const pokeKnight = useCallback(() => unlock('knight_tap'), [unlock])

  return (
    <footer ref={ref} className="relative border-t border-pixel-blue/10 overflow-hidden">
      {/* LAYER 0: parallax backdrop (paused off-screen) */}
      <div className="absolute inset-0 z-0">
        {inView && <ParallaxBackground />}
      </div>

      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(10, 14, 26, 0.93) 0%,
            rgba(10, 14, 26, 0.88) 40%,
            rgba(10, 14, 26, 0.55) 68%,
            rgba(10, 14, 26, 0.15) 85%,
            rgba(10, 14, 26, 0.0) 100%
          )`,
        }}
      />

      <div className="relative z-20">
        {/* Tech marquee */}
        <div className="border-b border-pixel-blue/10 overflow-hidden py-3 bg-bg-primary/30 backdrop-blur-sm">
          <div className="marquee-track">
            {[...TECH_MARQUEE, ...TECH_MARQUEE, ...TECH_MARQUEE, ...TECH_MARQUEE].map((tech, i) => (
              <span key={i} className="flex items-center gap-2 font-mono text-pixel-blue/40 text-xs mx-4 whitespace-nowrap">
                <PixelIcon name="dot" size={7} className="text-pixel-cyan/50" /> {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <div
                    className="absolute inset-0 bg-pixel-blue/20 border border-pixel-blue/50"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-pixel text-pixel-blue text-[10px]">RA</span>
                </div>
                <span className="font-pixel text-pixel-white text-xs">{SITE.name}</span>
              </div>
              <p className="font-mono text-pixel-gray/70 text-xs leading-relaxed">
                {SITE.role} from {SITE.location}.
                Building worlds, one commit at a time.
              </p>
              <div className="flex gap-3">
                {SOCIALS.map(({ id, label, href, value }) => {
                  const Icon = SOCIAL_ICON[id]
                  return (
                    <a
                      key={id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={value}
                      className="w-8 h-8 flex items-center justify-center border border-pixel-blue/30 text-pixel-gray hover:text-pixel-cyan hover:border-pixel-cyan/60 hover:bg-pixel-cyan/10 transition-colors backdrop-blur-sm"
                    >
                      <Icon size={15} aria-hidden />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Waypoint list */}
            <div>
              <p className="font-pixel text-pixel-blue/60 text-[9px] tracking-widest mb-4">WAYPOINTS</p>
              <ul className="space-y-2">
                {NAV_ITEMS.map(({ id, label, index }) => (
                  <li key={id}>
                    <button
                      onClick={() => handleNav(id)}
                      className="font-mono text-pixel-gray/70 text-sm hover:text-pixel-cyan transition-colors flex items-center gap-2 group w-full"
                    >
                      <span className="font-pixel text-[8px] text-pixel-blue/40 group-hover:text-pixel-cyan/70 transition-colors">
                        {index}
                      </span>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status */}
            <div>
              <p className="font-pixel text-pixel-blue/60 text-[9px] tracking-widest mb-4">STATUS</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 animate-pulse" />
                  <span className="font-mono text-pixel-gray/70 text-xs">Available for freelance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pixel-blue" />
                  <span className="font-mono text-pixel-gray/70 text-xs">Open to collaborations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400" />
                  <span className="font-mono text-pixel-gray/70 text-xs">Learning new skills daily</span>
                </div>
                <div className="pt-4 border-t border-pixel-blue/10">
                  <p className="font-pixel text-pixel-gray/40 text-[8px] mb-2">BUILT WITH</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'Vite', 'Tailwind', 'Framer'].map(t => (
                      <span key={t} className="font-mono text-pixel-blue/50 text-xs px-1.5 py-0.5 border border-pixel-blue/20 bg-bg-primary/20 backdrop-blur-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Knight runner — clickable for the hidden BRAVE KNIGHT achievement */}
        <div className="relative" style={{ height: '100px' }}>
          <button
            type="button"
            onClick={pokeKnight}
            aria-label="Poke the running knight"
            title="..."
            className="absolute inset-0 z-30 cursor-pointer"
            style={{ background: 'transparent' }}
          />
          <div className="absolute inset-0" style={{ filter: 'drop-shadow(0 0 6px rgba(0,200,255,0.25))' }}>
            <KnightRunner />
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-white/5 bg-bg-primary/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-pixel-gray/50 text-xs">© {year} {SITE.name}. All rights reserved.</p>
            <p className="font-mono text-pixel-gray/50 text-xs flex items-center gap-1.5">
              Made with
              <PixelIcon name="heart" size={12} className="text-red-400/80 animate-pulse mx-0.5" />
              and too much coffee
            </p>
            <p className="font-pixel text-pixel-gray/30 text-[8px]">{SITE.version} · GAME ON</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { FiGithub, FiInstagram, FiHeart } from 'react-icons/fi'
import ParallaxBackground from './footer/ParallaxBackground'
import KnightRunner from './footer/KnightRunner'
import { SiTiktok } from 'react-icons/si'

const navLinks = [
  { label: 'Home',         href: '#home' },
  { label: 'About',        href: '#about' },
  { label: 'Projects',     href: '#projects' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Skills',       href: '#skills' },
  { label: 'Contact',      href: '#contact' },
]

const socials = [
  { icon: <FiGithub />,    href: 'https://github.com/rillToMe',               label: 'GitHub'    },
  { icon: <SiTiktok />,     href: 'https://www.tiktok.com/@goodvibes_music28',  label: 'TikTok'    },
  { icon: <FiInstagram />, href: 'https://www.instagram.com/rill_lyrics/',     label: 'Instagram' },
]

const techMarquee = [
  'Unity','Godot','React','C#','Unreal','Blender',
  'JavaScript','Node.js','GitHub','VS Code','PostgreSQL','HTML/CSS',
]

export default function Footer() {
  const handleNav = (href: string) => {
    document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' })
  }

  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-pixel-blue/10 overflow-hidden">

      {/*  LAYER 0: Parallax full background  */}
      <div className="absolute inset-0 z-0">
        <ParallaxBackground />
      </div>

      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(10, 14, 26, 0.93) 0%,
              rgba(10, 14, 26, 0.88) 40%,
              rgba(10, 14, 26, 0.55) 68%,
              rgba(10, 14, 26, 0.15) 85%,
              rgba(10, 14, 26, 0.0)  100%
            )
          `,
        }}
      />

      {/* Content footer  */}
      <div className="relative z-20">

        {/* Tech marquee - truly infinite */}
        <div className="border-b border-pixel-blue/10 overflow-hidden py-3 bg-bg-primary/30 backdrop-blur-sm">
          <style>{`
            @keyframes marquee-infinite {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
              animation: marquee-infinite 24s linear infinite;
            }
          `}</style>
          <div className="marquee-track">
            {[...techMarquee, ...techMarquee, ...techMarquee, ...techMarquee].map((tech, i) => (
              <span key={i} className="flex items-center gap-2 font-mono text-pixel-blue/40 text-xs mx-4 whitespace-nowrap">
                <span className="text-pixel-cyan/50">◆</span> {tech}
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
                  <span className="absolute inset-0 flex items-center justify-center font-pixel text-pixel-blue text-xs">RA</span>
                </div>
                <span className="font-sans font-bold text-pixel-white text-lg">Rahmat Aditya</span>
              </div>
              <p className="font-mono text-pixel-gray/70 text-xs leading-relaxed">
                Game Developer & Web Enthusiast from Sumatera Barat, Indonesia.
                Building worlds, one commit at a time.
              </p>
              <div className="flex gap-3">
                {socials.map(({ icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-8 h-8 flex items-center justify-center border border-pixel-blue/30 text-pixel-gray hover:text-pixel-blue hover:border-pixel-blue/70 hover:bg-pixel-blue/10 transition-all text-sm backdrop-blur-sm">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <p className="font-pixel text-pixel-blue/60 text-[9px] tracking-widest mb-4">NAVIGATION</p>
              <ul className="space-y-2">
                {navLinks.map(({ label, href }) => (
                  <li key={href}>
                    <button onClick={() => handleNav(href)}
                      className="font-mono text-pixel-gray/70 text-sm hover:text-pixel-blue transition-colors flex items-center gap-2 group">
                      <span className="text-pixel-blue/40 group-hover:text-pixel-blue transition-colors">›</span>
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
                      <span key={t} className="font-mono text-pixel-blue/50 text-xs px-1.5 py-0.5 border border-pixel-blue/20 bg-bg-primary/20 backdrop-blur-sm">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Knight runner */}
        <div className="relative" style={{ height: '100px', filter: 'drop-shadow(0 0 6px rgba(0,200,255,0.25))' }}>
          <KnightRunner />
        </div>

        {/* Copyright bar */}
        <div className="border-t border-white/5 bg-bg-primary/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-pixel-gray/50 text-xs">© {year} Rahmat Aditya. All rights reserved.</p>
            <p className="font-mono text-pixel-gray/50 text-xs flex items-center gap-1.5">
              Made with <FiHeart className="text-red-400/70 text-xs animate-pulse mx-1" /> and too much coffee
            </p>
            <p className="font-pixel text-pixel-gray/30 text-[8px]">v2.0.0 · GAME ON</p>
          </div>
        </div>
      </div>

    </footer>
  )
}
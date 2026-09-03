import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)

      const sections = navItems.map(item => item.href.replace('#', ''))
      for (const sec of sections.reverse()) {
        const el = document.getElementById(sec)
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(sec)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNav = (href: string) => {
    setMenuOpen(false)
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/90 backdrop-blur-md border-b border-pixel-blue/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNav('#home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 bg-pixel-blue/20 border border-pixel-blue/50 group-hover:bg-pixel-blue/30 transition-all"
                   style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }} />
              <span className="absolute inset-0 flex items-center justify-center font-pixel text-pixel-blue text-xs">
                RA
              </span>
            </div>
            <span className="font-mono text-pixel-white/80 text-sm group-hover:text-pixel-blue transition-colors">
              <span className="text-pixel-blue">@</span>adit
            </span>
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const id = item.href.replace('#', '')
              const isActive = active === id
              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNav(item.href)}
                    className={`relative px-4 py-2 font-mono text-sm transition-all duration-200 group ${
                      isActive
                        ? 'text-pixel-blue'
                        : 'text-pixel-gray hover:text-pixel-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 bg-pixel-blue/10 border border-pixel-blue/30"
                        style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block w-6 h-0.5 bg-pixel-blue transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-pixel-blue transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-pixel-blue transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-lg border-b border-pixel-blue/20 md:hidden"
          >
            <ul className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNav(item.href)}
                    className="w-full text-left px-4 py-3 font-mono text-sm text-pixel-gray hover:text-pixel-blue hover:bg-pixel-blue/5 transition-all border border-transparent hover:border-pixel-blue/20"
                  >
                    <span className="text-pixel-blue mr-2">▶</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
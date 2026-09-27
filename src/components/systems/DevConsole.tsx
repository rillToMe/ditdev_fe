import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PixelIcon from './PixelIcon'
import { useAchievements } from './AchievementsProvider'
import { ACHIEVEMENTS } from './achievements'
import { SITE, NAV_ITEMS } from '../../data/site'
import { EASE } from '../../lib/motion'

interface Line {
  id: number
  kind: 'in' | 'out' | 'err' | 'ok'
  text: string
}

interface DevConsoleProps {
  open: boolean
  onClose: () => void
  onNavigate: (id: string) => void
}

const BOOT: Line[] = [
  { id: 0, kind: 'out', text: `ditdev realm console ${SITE.version} — type "help"` },
  { id: 1, kind: 'out', text: 'read-only shell · press ~ or ESC to close' },
]

export default function DevConsole({ open, onClose, onNavigate }: DevConsoleProps) {
  const { xp, unlockedCount, total, mapProgress, unlocked, unlock } = useAchievements()
  const [lines, setLines] = useState<Line[]>(BOOT)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const lineId = useRef(BOOT.length)

  useEffect(() => {
    if (open) {
      unlock('shell_hacker')
      // Focus after the mount animation begins.
      const t = window.setTimeout(() => inputRef.current?.focus(), 60)
      return () => window.clearTimeout(t)
    }
  }, [open, unlock])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const push = (kind: Line['kind'], text: string) => {
    setLines(prev => [...prev, { id: lineId.current++, kind, text }])
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    push('in', cmd)

    const [name, ...args] = cmd.toLowerCase().split(/\s+/)

    switch (name) {
      case 'help':
        push('out', 'commands: whoami · goto <zone> · stats · achievements · clear')
        push('out', 'goto zones: ' + NAV_ITEMS.map(n => n.id).join(', '))
        break
      case 'whoami':
        push('ok', `${SITE.name} — ${SITE.role}`)
        push('out', `location: ${SITE.location}`)
        push('out', `contact: ${SITE.email}`)
        break
      case 'goto': {
        const zone = args[0]
        if (!zone) { push('err', 'usage: goto <zone>'); break }
        if (!NAV_ITEMS.some(n => n.id === zone)) { push('err', `unknown zone "${zone}"`); break }
        push('ok', `traveling to ${zone}...`)
        onNavigate(zone)
        window.setTimeout(onClose, 220)
        break
      }
      case 'stats':
        push('out', `xp ......... ${xp}`)
        push('out', `badges ..... ${unlockedCount}/${total}`)
        push('out', `map ........ ${Math.round(mapProgress * 100)}%`)
        push('out', `viewport ... ${window.innerWidth}×${window.innerHeight}`)
        break
      case 'achievements':
        ACHIEVEMENTS.forEach(a => {
          const got = unlocked.has(a.id)
          push(got ? 'ok' : 'out', `${got ? '[x]' : '[ ]'} ${a.title} — ${a.hint}`)
        })
        break
      case 'clear':
        setLines([])
        break
      default:
        push('err', `command not found: ${name}`)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9995] bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE.snap }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-2xl border border-pixel-cyan/30 bg-[#04070d]/97"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
              boxShadow: '0 0 50px rgba(0,212,255,0.12)',
            }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-pixel-cyan/15">
              <PixelIcon name="terminal" size={14} className="text-pixel-cyan" />
              <span className="font-pixel text-[9px] text-pixel-cyan tracking-widest">DITDEV://CONSOLE</span>
              <span className="ml-auto font-mono text-[10px] text-pixel-gray/40">{SITE.version}</span>
              <button onClick={onClose} className="text-pixel-gray/50 hover:text-pixel-white transition-colors p-1" aria-label="Close console">
                <PixelIcon name="close" size={14} />
              </button>
            </div>

            {/* Output */}
            <div ref={bodyRef} className="h-64 sm:h-72 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed space-y-0.5">
              {lines.map(l => (
                <div
                  key={l.id}
                  className={
                    l.kind === 'in'  ? 'text-pixel-white' :
                    l.kind === 'err' ? 'text-red-400' :
                    l.kind === 'ok'  ? 'text-green-400' :
                    'text-pixel-gray/70'
                  }
                >
                  {l.kind === 'in' && <span className="text-pixel-cyan mr-1.5">$</span>}
                  {l.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={e => { e.preventDefault(); run(value); setValue('') }}
              className="flex items-center gap-2 px-4 py-3 border-t border-pixel-cyan/15"
            >
              <span className="font-mono text-pixel-cyan text-sm">$</span>
              <input
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="type a command..."
                className="flex-1 bg-transparent font-mono text-sm text-pixel-white placeholder-pixel-gray/30 focus:outline-none"
              />
              <button type="submit" className="font-pixel text-[8px] text-pixel-cyan/60 hover:text-pixel-cyan tracking-widest">
                ENTER
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

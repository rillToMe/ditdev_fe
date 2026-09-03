import { useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FORBIDDEN_MESSAGES = [
  'This action is forbidden in this realm.',
  'The guardian denies your request.',
  'Such power is not yours to wield, traveler.',
  'Access restricted by CHANGLI-AI.',
  'You lack the permissions for this spell.',
  'The realm protects its secrets.',
  'Unauthorized action detected.',
]

interface Tooltip {
  x: number
  y: number
  message: string
  id: number
}

export default function RightClickGuard({ children }: { children: ReactNode }) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()

      if (hideTimer.current) clearTimeout(hideTimer.current)

      const msg = FORBIDDEN_MESSAGES[Math.floor(Math.random() * FORBIDDEN_MESSAGES.length)]

      // Keep tooltip inside viewport
      const x = Math.min(e.clientX, window.innerWidth  - 220)
      const y = Math.min(e.clientY, window.innerHeight - 80)

      setTooltip({ x, y, message: msg, id: Date.now() })

      hideTimer.current = setTimeout(() => setTooltip(null), 2200)
    }

    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  return (
    <>
      {children}

      {/* Tooltip portal - fixed, above everything */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.id}
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.92,    y: -4 }}
            transition={{ duration: 0.18 }}
            className="fixed z-[99999] pointer-events-none select-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div
              className="px-3 py-2.5 backdrop-blur-sm"
              style={{
                background : 'rgba(10, 14, 26, 0.97)',
                border     : '1px solid rgba(139, 0, 0, 0.45)',
                clipPath   : 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                boxShadow  : '0 0 20px rgba(139,0,0,0.2)',
                maxWidth   : '210px',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span style={{ color: '#8b0000', fontSize: '9px' }}>⚠</span>
                <p className="font-pixel text-red-700 text-[8px] tracking-widest">ACCESS DENIED</p>
              </div>

              {/* Message */}
              <p className="font-mono leading-relaxed" style={{ color: 'rgba(180,160,140,0.8)', fontSize: '10px' }}>
                {tooltip.message}
              </p>

              {/* Footer */}
              <p className="font-pixel mt-1.5" style={{ color: 'rgba(79,140,255,0.35)', fontSize: '7px' }}>
                - CHANGLI-AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiX, FiSend, FiZap, FiEdit, FiCopy, FiCheck, FiCornerDownLeft } from 'react-icons/fi'
import { useChat } from '../hooks/useChat'
import { useAchievements } from '../../components/systems/AchievementsProvider'
import type { ChatMessage } from '../../types/api'

const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'))

import avatarImg from '../../assets/img/icons/ai_icon.jpg'

/* ── Streaming reveal ──────────────────────────────────────────────────
   Newly-arrived replies resolve out of nothing, character by character —
   the "scroll being written" beat. Only ever applied to a reply that lands
   after mount (never to restored history), so a reload doesn't replay it.
   `onDone` lets the parent remember the id, so closing and reopening the
   panel doesn't replay the same reply. */
function useStreamReveal(content: string, enabled: boolean, onDone?: () => void) {
  const reduced = useReducedMotion()
  const [n, setN] = useState(() => (enabled && !reduced ? 0 : content.length))

  useEffect(() => {
    if (!enabled || reduced) { setN(content.length); return }

    let raf = 0
    const start = performance.now()
    // ~6ms per char, clamped so a long reply still lands inside ~1.6s.
    const perChar = Math.min(6, 1600 / Math.max(content.length, 1))

    const tick = (now: number) => {
      const count = Math.min(Math.floor((now - start) / perChar), content.length)
      setN(count)
      if (count < content.length) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [content, enabled, reduced])

  const streaming = n < content.length

  // Record completion so the parent can skip the replay on remount.
  useEffect(() => {
    if (enabled && !streaming) onDone?.()
  }, [enabled, streaming, onDone])

  return { text: content.slice(0, n), streaming }
}

/* ── Animated avatar ─────────────────────────────────────────────────── */
interface NpcAvatarProps {
  size?: number
  pulse?: boolean
  thinking?: boolean
}

function NpcAvatar({ size = 32, pulse = false, thinking = false }: NpcAvatarProps) {
  const clip = 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Soft halo — pulses while the guide is speaking/thinking */}
      <div
        className={`absolute -inset-1 pointer-events-none ${pulse || thinking ? 'animate-pulse' : ''}`}
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.28) 0%, transparent 70%)' }}
      />

      {/* Frame */}
      <div className="absolute inset-0 border-2 border-pixel-cyan/70 z-10 pointer-events-none" style={{ clipPath: clip }} />

      <div className="w-full h-full overflow-hidden relative" style={{ clipPath: clip }}>
        <img
          src={avatarImg}
          alt="Changli"
          className="w-full h-full object-cover object-top"
          style={{ filter: 'saturate(0.85) brightness(0.9) contrast(1.05)' }}
        />
        {/* Cyan tint */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,212,255,0.05)' }} />
        {/* Traveling scanline */}
        <div
          className="absolute left-0 right-0 h-1/3 pointer-events-none chat-scanline"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.35), transparent)' }}
        />
      </div>

      {/* Online dot */}
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-bg-primary z-20">
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
      </div>
    </div>
  )
}

/* ── Signal strength bars ────────────────────────────────────────────── */
function SignalBars() {
  const reduced = useReducedMotion()
  const heights = [4, 7, 10]
  return (
    <div className="flex items-end gap-[2px] h-3" aria-hidden>
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] bg-pixel-cyan/70"
          style={{ height: h }}
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ── HUD corner brackets ─────────────────────────────────────────────── */
function CornerBrackets({ className = 'border-pixel-cyan/40' }: { className?: string }) {
  const c = `absolute w-3 h-3 pointer-events-none z-10 ${className}`
  return (
    <>
      <span className={`${c} top-1.5 left-1.5 border-t border-l`} />
      <span className={`${c} top-1.5 right-1.5 border-t border-r`} />
      <span className={`${c} bottom-1.5 left-1.5 border-b border-l`} />
      <span className={`${c} bottom-1.5 right-1.5 border-b border-r`} />
    </>
  )
}

/* ── Message bubble ──────────────────────────────────────────────────── */
function MessageBubble({
  message,
  index,
  stream,
  onStreamDone,
}: {
  message: ChatMessage
  index: number
  stream: boolean
  onStreamDone?: (id: number) => void
}) {
  const isAI = message.role === 'assistant'
  const [copied, setCopied] = useState(false)
  const done = useCallback(() => onStreamDone?.(message.id), [onStreamDone, message.id])
  const { text, streaming } = useStreamReveal(message.content, stream, done)

  const copy = () => {
    navigator.clipboard?.writeText(message.content).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    }).catch(() => { /* clipboard blocked */ })
  }

  const seq = String(index + 1).padStart(2, '0')

  if (!isAI) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, x: 12 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-end gap-1"
      >
        <div className="flex items-center gap-1.5 pr-0.5">
          <span className="font-mono text-[8px] text-pixel-gray/35 tracking-widest">TRAVELER</span>
          <span className="font-mono text-[8px] text-pixel-blue/40">#{seq}</span>
        </div>
        <div
          className="max-w-[85%] px-3 py-2.5 font-mono border border-pixel-blue/40 relative"
          style={{
            clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
            background: 'linear-gradient(135deg, #0a1a3a 0%, #0b1f47 100%)',
            boxShadow: '0 0 18px rgba(79,140,255,0.12)',
          }}
        >
          <p className="text-[11px] leading-relaxed text-pixel-white">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: -12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-2 group/msg"
    >
      <NpcAvatar size={28} thinking={streaming} />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Name plate */}
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[8px] text-pixel-cyan/90 tracking-wider">CHANGLI-AI</span>
          <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono text-[8px] text-pixel-gray/30">#{seq}</span>
        </div>

        {/* Dialogue box */}
        <div className="relative">
          <div
            className="relative px-3 py-2.5 font-mono border border-pixel-blue/25 overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              background: 'linear-gradient(160deg, #0d1528 0%, #0a1120 100%)',
              boxShadow: 'inset 0 0 24px rgba(0,212,255,0.04)',
            }}
          >
            {/* Faint grid wash */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.5]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(79,140,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,140,255,0.04) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
            {/* Left accent spine */}
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-pixel-cyan/70 via-pixel-blue/40 to-transparent" />

            <div className="relative">
              {streaming ? (
                <p className="text-[11px] leading-relaxed text-pixel-white/90 whitespace-pre-wrap break-words">
                  {text}
                  <span className="chat-caret inline-block w-1.5 h-3 bg-pixel-cyan/80 ml-0.5 align-middle" />
                </p>
              ) : (
                <Suspense fallback={<p className="text-[11px] text-pixel-gray/50">…</p>}>
                  <MarkdownRenderer content={message.content} />
                </Suspense>
              )}
            </div>
          </div>

          {/* Copy button — appears on hover, only once fully revealed */}
          {!streaming && (
            <button
              onClick={copy}
              title={copied ? 'Copied' : 'Copy reply'}
              aria-label="Copy reply"
              className="absolute -top-2 -right-1 z-20 p-1 border border-pixel-blue/25 bg-bg-primary/90 text-pixel-gray/50 opacity-0 group-hover/msg:opacity-100 hover:text-pixel-cyan hover:border-pixel-cyan/50 transition-all"
            >
              {copied ? <FiCheck className="text-[10px] text-green-400" /> : <FiCopy className="text-[10px]" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Typing indicator ────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 items-start"
    >
      <NpcAvatar size={28} thinking />
      <div className="flex flex-col gap-1">
        <span className="font-pixel text-[8px] text-pixel-cyan/70 tracking-wider animate-pulse">
          CHANGLI-AI is channeling…
        </span>
        <div
          className="relative px-3 py-2.5 border border-pixel-blue/25 overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
            background: '#0d1528',
          }}
        >
          <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-pixel-cyan/70 to-transparent" />
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-pixel-cyan/80"
                animate={{ opacity: [0.25, 1, 0.25], scaleY: [1, 1.6, 1] }}
                transition={{ duration: 0.9, delay: i * 0.14, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            <span className="ml-1 font-mono text-[9px] text-pixel-gray/40 tracking-widest">THINKING</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main widget ─────────────────────────────────────────────────────── */
export default function ChangliChat() {
  const {
    messages, input, setInput, isLoading,
    isOpen, setIsOpen, sendMessage,
    sectionHint, setSectionHint, quickPrompts,
    resetChat,
  } = useChat()

  const { unlock } = useAchievements()
  const greeted = useRef(false)

  // Opening the guide and talking to it unlocks NPC FRIEND.
  useEffect(() => {
    if (isOpen && !greeted.current) {
      greeted.current = true
      unlock('npc_friend')
    }
  }, [isOpen, unlock])

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Replies that have already played their reveal. Seeded from everything
  // present at mount, so restored history never replays; every reply that
  // arrives afterwards streams exactly once (and not again on panel reopen,
  // because this state lives in ChangliChat, which outlives the panel).
  const [played, setPlayed] = useState<Set<number>>(() => new Set(messages.map(m => m.id)))
  const markPlayed = useCallback((id: number) => {
    setPlayed(prev => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  return (
    <>
      {/* Section hint toast */}
      <AnimatePresence>
        {sectionHint && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-24 right-6 z-40 max-w-[220px] cursor-pointer"
            onClick={() => { setIsOpen(true); setSectionHint(null) }}
          >
            <div
              className="relative bg-bg-secondary/95 border border-pixel-cyan/30 px-3 py-2.5 backdrop-blur-sm overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                <p className="font-pixel text-[7px] text-pixel-cyan">CHANGLI-AI</p>
              </div>
              <p className="font-mono text-pixel-white/80 text-xs leading-relaxed">{sectionHint}</p>
            </div>
            {/* Arrow pointing to button */}
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-bg-secondary border-r border-b border-pixel-cyan/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        title="Talk to CHANGLI-AI"
      >
        {/* Glow halo */}
        <div
          className="absolute -inset-1 animate-pulse pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)' }}
        />

        {/* Pixel-cut border frame */}
        <div
          className="absolute inset-0 border-2 border-pixel-cyan/80 pointer-events-none z-10"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
        />

        {/* Photo + close icon container */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center bg-bg-secondary/90 z-20"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <FiX className="text-pixel-cyan text-xl" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <img
                src={avatarImg}
                alt="CHANGLI"
                className="w-full h-full object-cover object-top"
                style={{ filter: 'saturate(0.8) brightness(0.85) contrast(1.1)' }}
              />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,212,255,0.07)' }} />
              <div
                className="absolute left-0 right-0 h-1/3 pointer-events-none chat-scanline"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.4), transparent)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 flex items-center justify-center py-0.5">
                <span className="font-pixel text-pixel-cyan text-[6px] tracking-widest">CHANGLI</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Online dot */}
        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-bg-primary z-30" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col"
            style={{
              height: '540px',
              maxHeight: 'calc(100vh - 140px)',
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            }}
          >
            {/* Panel background + ambient wash */}
            <div className="absolute inset-0 border border-pixel-cyan/30" style={{ background: '#080c18' }} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(120% 60% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 60%)' }}
            />
            <CornerBrackets />

            {/* Content */}
            <div className="relative flex flex-col h-full">

              {/* ── Title bar ── */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-pixel-blue/15 bg-black/30">
                <span className="w-2 h-2 bg-red-400/60" />
                <span className="w-2 h-2 bg-yellow-400/60" />
                <span className="w-2 h-2 bg-green-400/60" />
                <span className="font-mono text-[10px] text-pixel-gray/40 ml-1">changli.chat</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <SignalBars />
                  <span className="font-mono text-[8px] text-green-400/80 tracking-widest">LINK</span>
                </span>
                <button
                  onClick={resetChat}
                  title="New chat"
                  aria-label="Start a new chat"
                  className="text-pixel-gray/40 hover:text-pixel-cyan transition-colors p-1"
                >
                  <FiEdit className="text-sm" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  aria-label="Close chat"
                  className="text-pixel-gray/40 hover:text-pixel-white transition-colors p-1"
                >
                  <FiX className="text-sm" />
                </button>
              </div>

              {/* ── Identity strip ── */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-pixel-blue/15 relative overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.4]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.25) 3px 4px)',
                  }}
                />
                <NpcAvatar size={38} pulse />
                <div className="flex-1 min-w-0 relative">
                  <div className="flex items-center gap-2">
                    <p className="font-pixel text-pixel-cyan text-[10px]">CHANGLI-AI</p>
                    <span className="flex items-center gap-1 font-mono text-green-400 text-[9px]">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      ONLINE
                    </span>
                  </div>
                  <p className="font-mono text-pixel-gray/50 text-[9px] truncate">
                    Guardian of Rahmat's Portfolio · Quest Guide
                  </p>
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 chat-scroll relative">
                {messages.map((msg, i) => {
                  const stream = msg.role === 'assistant' && !played.has(msg.id)
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      index={i}
                      stream={stream}
                      onStreamDone={markPlayed}
                    />
                  )
                })}
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* ── Quick prompts ── */}
              {messages.length <= 1 && (
                <div className="px-3 pb-2.5">
                  <p className="font-mono text-[8px] text-pixel-gray/30 tracking-widest mb-1.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-pixel-cyan/50" />
                    SUGGESTED QUERIES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map(({ label, text }) => (
                      <button
                        key={label}
                        onClick={() => sendMessage(text)}
                        className="group/chip font-mono text-[10px] text-pixel-blue/70 border border-pixel-blue/20 px-2 py-1 hover:border-pixel-blue/60 hover:text-pixel-blue hover:bg-pixel-blue/5 transition-all flex items-center gap-1"
                        style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                      >
                        <span className="text-pixel-cyan/50 group-hover/chip:text-pixel-cyan transition-colors">▸</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input ── */}
              <div className="px-3 pb-3 border-t border-pixel-blue/10 pt-2.5 bg-black/20">
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 flex items-center border border-pixel-blue/25 focus-within:border-pixel-cyan/60 transition-colors relative"
                    style={{ background: '#060a14' }}
                  >
                    <span className="pl-2.5 font-pixel text-pixel-cyan/60 text-[9px] select-none">&gt;</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask the guide..."
                      maxLength={500}
                      className="flex-1 bg-transparent px-2 py-2 font-mono text-xs text-pixel-white placeholder-pixel-gray/30 focus:outline-none"
                    />
                    {input.length > 0 && (
                      <span className={`pr-2 font-mono text-[9px] tabular-nums ${input.length > 450 ? 'text-yellow-400/70' : 'text-pixel-gray/25'}`}>
                        {input.length}/500
                      </span>
                    )}
                  </div>
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim()}
                    whileTap={{ scale: 0.94 }}
                    className="w-9 h-9 flex items-center justify-center border border-pixel-blue/30 bg-pixel-blue/10 text-pixel-blue hover:bg-pixel-blue/25 hover:border-pixel-blue/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Send message"
                  >
                    {isLoading
                      ? <FiZap className="text-sm animate-pulse text-pixel-cyan" />
                      : <FiSend className="text-sm" />
                    }
                  </motion.button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="font-pixel text-pixel-gray/20 text-[7px]">CHANGLI-AI · REALM GUIDE v1.0</p>
                  <p className="font-mono text-pixel-gray/25 text-[8px] flex items-center gap-1">
                    <FiCornerDownLeft className="text-[9px]" />
                    ENTER to send
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

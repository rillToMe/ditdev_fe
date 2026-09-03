import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'
import type { Admin } from '../../types/api'

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'
const pixelClipLg = 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'

const inputClass = [
  'w-full px-4 py-3 text-sm font-mono',
  'bg-[#070a14] border border-[rgba(79,140,255,0.15)]',
  'text-[#e2e8f0] placeholder-[rgba(148,163,184,0.3)]',
  'focus:outline-none focus:border-[rgba(79,140,255,0.5)]',
  'transition-all duration-200',
].join(' ')

interface ParticleProps {
  x: number
  y: number
  size: number
  dur: number
  delay: number
  color: string
}

function Particle({ x, y, size, dur, delay, color }: ParticleProps) {
  return (
    <motion.div
      className="absolute rounded-none pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [0, -40, 0], opacity: [0.15, 0.5, 0.15] }}
      transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

const PARTICLES: ParticleProps[] = Array.from({ length: 24 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() > 0.7 ? 3 : 2,
  dur: 3 + Math.random() * 4,
  delay: Math.random() * 3,
  color: ['rgba(79,140,255,0.4)', 'rgba(0,212,255,0.3)', 'rgba(162,155,254,0.3)'][i % 3],
}))

interface LoginProps {
  onLogin: (admin: Admin) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login({ username, password })
      localStorage.setItem('admin_token', data.token)
      onLogin(data.admin)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#050709' }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)' }} />

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(79,140,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(79,140,255,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,140,255,0.06) 0%, transparent 70%)' }} />

      {/* Card */}
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260, delay: 0.1 }}
        className="relative w-full max-w-md"
        style={{
          background: 'linear-gradient(135deg,#0a0e1a 0%,#0d1220 100%)',
          border: '1px solid rgba(79,140,255,0.18)',
          clipPath: pixelClipLg,
          boxShadow: '0 0 80px rgba(79,140,255,0.07), 0 32px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,transparent,rgba(79,140,255,0.6),rgba(0,212,255,0.4),transparent)' }} />

        <div className="px-8 py-10">
          {/* Logo */}
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-10"
          >
            {/* Pixel icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 mb-5 relative"
              style={{ background: 'rgba(79,140,255,0.08)', border: '1px solid rgba(79,140,255,0.2)', clipPath: pixelClip }}>
              <span className="text-2xl">⚔️</span>
              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#4f8cff]/30" />
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#00d4ff]/30" />
            </div>

            <h1 className="font-pixel text-base tracking-widest text-[#e2e8f0] mb-2">
              ADMIN PORTAL
            </h1>
            <p className="font-mono text-xs text-[rgba(148,163,184,0.4)]">
              // authenticate to enter the realm
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
              <label className="block font-pixel text-[10px] tracking-widest text-[rgba(148,163,184,0.5)] mb-2 uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                style={{ clipPath: pixelClip }}
                placeholder="enter username"
                required
              />
            </motion.div>

            {/* Password */}
            <motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <label className="block font-pixel text-[10px] tracking-widest text-[rgba(148,163,184,0.5)] mb-2 uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass + ' pr-12'}
                  style={{ clipPath: pixelClip }}
                  placeholder="enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(148,163,184,0.35)] hover:text-[rgba(148,163,184,0.7)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 px-4 py-3"
                style={{ background: 'rgba(139,0,0,0.12)', border: '1px solid rgba(239,68,68,0.25)', clipPath: pixelClip }}
              >
                <span className="text-red-500 text-xs mt-0.5">⚠</span>
                <p className="font-mono text-xs text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-pixel text-xs tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? 'rgba(79,140,255,0.08)' : 'rgba(79,140,255,0.12)',
                  border: '1px solid rgba(79,140,255,0.35)',
                  color: '#4f8cff',
                  clipPath: pixelClip,
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(79,140,255,0.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(79,140,255,0.12)' }}
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(79,140,255,0.3)', borderTopColor: '#4f8cff' }} />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    ENTER REALM
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center font-pixel text-[8px] tracking-widest text-[rgba(79,140,255,0.2)]">
            PORTFOLIO ADMIN · v2.0.0
          </p>
        </div>
      </motion.div>

      {/* Corner tags */}
      <div className="absolute top-4 left-4 font-pixel text-[8px] text-[rgba(79,140,255,0.15)] tracking-widest">ADMIN_PORTAL</div>
      <div className="absolute bottom-4 right-4 font-pixel text-[8px] text-[rgba(79,140,255,0.1)]">CHANGLI-AI PROTECTED</div>
    </motion.div>
  )
}
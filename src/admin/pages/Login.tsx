import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, ShieldCheck, AlertTriangle, Sun, Moon } from 'lucide-react'
import api from '../services/api'
import { inputCls, labelCls } from '../ui'
import type { Theme } from '../theme'
import type { Admin } from '../../types/api'

interface LoginProps {
  onLogin: (admin: Admin) => void
  theme: Theme
  onToggleTheme: () => void
}

export default function Login({ onLogin, theme, onToggleTheme }: LoginProps) {
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
      className="admin-auth"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="admin-auth-card"
      >
        <button
          type="button"
          className="admin-iconbtn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{ position: 'absolute', top: 16, right: 16 }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="admin-auth-mark">
          <ShieldCheck size={26} />
        </div>

        <h1 className="admin-auth-title">Admin Console</h1>
        <p className="admin-auth-sub">Sign in to manage your portfolio content</p>

        <form onSubmit={handleSubmit} className="space-y-4" style={{ marginTop: 26 }}>
          <div>
            <label className={labelCls} htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="admin-password">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                style={{ paddingRight: 42 }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 -translate-y-1/2 text-[var(--a-muted)] hover:text-[var(--a-text-dim)] transition-colors"
                style={{ right: 12 }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-alert"
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn--primary admin-btn--block"
            style={{ height: 42, marginTop: 6 }}
          >
            {loading ? (
              <>
                <span className="admin-spinner admin-spinner--sm" style={{ borderTopColor: '#fff' }} />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="admin-auth-sub" style={{ marginTop: 24, fontSize: 12 }}>
          Portfolio Admin · v2.0.0
        </p>
      </motion.div>
    </motion.div>
  )
}

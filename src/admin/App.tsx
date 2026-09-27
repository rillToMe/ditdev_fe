import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import api from './services/api'
import { getStoredTheme, applyTheme, clearTheme } from './theme'
import type { Theme } from './theme'
import type { Admin } from '../types/api'
import './admin.css'

function LoadingScreen() {
  return (
    <div className="admin-root">
      <div className="admin-loading" style={{ minHeight: '100vh' }}>
        <div className="admin-spinner" />
        <p>Loading admin console…</p>
      </div>
    </div>
  )
}

function AdminApp() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  // Theme class lives on <html> so modals (teleported to <body>) inherit it.
  // Remove it on unmount so leaving /admin never affects the portfolio.
  useEffect(() => {
    applyTheme(theme)
    return () => clearTheme()
  }, [theme])

  useEffect(() => { verifyAuth() }, [])

  const verifyAuth = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) { setLoading(false); return }
    try {
      const data = await api.verify()
      setAdmin(data.admin)
    } catch {
      localStorage.removeItem('admin_token')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await api.logout() } catch { /* ignore */ }
    localStorage.removeItem('admin_token')
    setAdmin(null)
  }

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  if (loading) return <LoadingScreen />

  return (
    <div className="admin-root">
      <AnimatePresence mode="wait">
        {admin
          ? <Dashboard key="dashboard" admin={admin} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
          : <Login key="login" onLogin={setAdmin} theme={theme} onToggleTheme={toggleTheme} />}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return <AdminApp />
}

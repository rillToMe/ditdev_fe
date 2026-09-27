import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderOpen, Award, TrendingUp, Database,
  RefreshCw, LogOut, Menu, ChevronRight, Layers, Sun, Moon,
} from 'lucide-react'
import api from '../services/api'
import type { Admin, Certificate, Project, Stat } from '../../types/api'
import type { LucideIcon } from 'lucide-react'
import type { Theme } from '../theme'
import ProjectsManager from '../components/ProjectsManager'
import CertificatesManager from '../components/CertificatesManager'
import StatsManager from '../components/StatsManager'
import RagManager from '../components/RagManager'

type SectionKey = 'overview' | 'projects' | 'certificates' | 'stats' | 'rag'

interface NavItem {
  key: SectionKey
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', icon: FolderOpen },
  { key: 'certificates', label: 'Certificates', icon: Award },
  { key: 'stats', label: 'Stats', icon: TrendingUp },
  { key: 'rag', label: 'RAG Index', icon: Database },
]

const PAGE_META: Record<SectionKey, { title: string; sub: string }> = {
  overview: { title: 'Overview', sub: 'A snapshot of your portfolio content' },
  projects: { title: 'Projects', sub: 'Create, edit and remove portfolio projects' },
  certificates: { title: 'Certificates', sub: 'Manage your achievements and credentials' },
  stats: { title: 'Stats', sub: 'Numbers shown in the About section' },
  rag: { title: 'RAG Index', sub: 'Knowledge the chatbot answers from' },
}

interface DashboardProps {
  admin: Admin
  onLogout: () => void
  theme: Theme
  onToggleTheme: () => void
}

export default function Dashboard({ admin, onLogout, theme, onToggleTheme }: DashboardProps) {
  const [active, setActive] = useState<SectionKey>('overview')
  const [projects, setProjects] = useState<Project[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Sidebar UI state (collapsed on desktop, drawer on mobile)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, c, s] = await Promise.all([api.getProjects(), api.getCertificates(), api.getStats()])
      setProjects(p.data || [])
      setCertificates(c.data || [])
      setStats(s.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const [p, c, s] = await Promise.all([
        api.getProjects(), api.getCertificates(), api.getStats(),
        new Promise(r => setTimeout(r, 400)),
      ])
      setProjects(p.data || [])
      setCertificates(c.data || [])
      setStats(s.data || [])
    } catch (err) {
      alert('Failed to refresh: ' + (err instanceof Error ? err.message : err))
    } finally {
      setRefreshing(false)
    }
  }

  const selectSection = (key: SectionKey) => {
    setActive(key)
    setDrawerOpen(false)
  }

  const meta = PAGE_META[active]

  const counts: Record<SectionKey, number | null> = {
    overview: null,
    projects: projects.length,
    certificates: certificates.length,
    stats: stats.length,
    rag: null,
  }

  return (
    <div className="admin-shell">
      {/* Mobile drawer scrim */}
      {drawerOpen && (
        <button className="admin-drawer-scrim" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${collapsed ? ' is-collapsed' : ''}${drawerOpen ? ' is-open' : ''}`}
      >
        {/* Brand */}
        <div className="admin-brand">
          <div className="admin-brand-mark"><Layers size={20} /></div>
          <div className="admin-brand-text">
            <div className="admin-brand-title">Admin Console</div>
            <div className="admin-brand-sub">Portfolio Manager</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          <div className="admin-nav-label">Content</div>
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = active === key
            const count = counts[key]
            return (
              <button
                key={key}
                onClick={() => selectSection(key)}
                className={`admin-nav-item${isActive ? ' is-active' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon className="admin-nav-icon" size={18} />
                <span className="admin-nav-text">{label}</span>
                {count !== null && <span className="admin-nav-badge admin-num">{count}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">
              {admin.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">{admin.username}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
          <button onClick={onLogout} className="admin-btn admin-btn--danger admin-btn--block">
            <LogOut size={16} />
            {!collapsed && 'Log out'}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className={`admin-main${collapsed ? ' is-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="admin-iconbtn"
            onClick={() => {
              if (window.matchMedia('(max-width: 1023px)').matches) setDrawerOpen(v => !v)
              else setCollapsed(v => !v)
            }}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <div className="admin-topbar-title truncate">{meta.title}</div>
            <div className="admin-topbar-sub truncate">{meta.sub}</div>
          </div>

          <div className="admin-topbar-actions">
            <button
              className="admin-iconbtn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="admin-iconbtn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <p>Loading data…</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {active === 'overview' && (
                  <Overview
                    admin={admin}
                    projects={projects}
                    certificates={certificates}
                    stats={stats}
                    onNavigate={selectSection}
                  />
                )}
                {active === 'projects' && <ProjectsManager projects={projects} onUpdate={loadData} />}
                {active === 'certificates' && <CertificatesManager certificates={certificates} onUpdate={loadData} />}
                {active === 'stats' && <StatsManager stats={stats} onUpdate={loadData} />}
                {active === 'rag' && <RagManager />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  )
}

/* ── Overview page ─────────────────────────────────────────────────────── */

interface OverviewProps {
  admin: Admin
  projects: Project[]
  certificates: Certificate[]
  stats: Stat[]
  onNavigate: (key: SectionKey) => void
}

function Overview({ admin, projects, certificates, stats, onNavigate }: OverviewProps) {
  const kpis = [
    { key: 'projects' as const, label: 'Projects', value: projects.length, icon: FolderOpen },
    { key: 'certificates' as const, label: 'Certificates', value: certificates.length, icon: Award },
    { key: 'stats' as const, label: 'Stats', value: stats.length, icon: TrendingUp },
  ]

  const recent = [...projects]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="admin-card"
        style={{
          padding: '20px 22px',
          background: 'linear-gradient(180deg, var(--a-tint) 0%, transparent 100%)',
          borderColor: 'var(--a-accent-border)',
        }}
      >
        <h2 className="admin-page-title">Welcome back, {admin.username}</h2>
        <p className="admin-page-sub" style={{ maxWidth: 620 }}>
          Here's the current state of your portfolio. Use the sidebar to manage projects,
          certificates, stats and the chatbot knowledge index.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map(({ key, label, value, icon: Icon }, i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onNavigate(key)}
            className="admin-kpi text-left"
          >
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">{label}</span>
              <Icon className="admin-kpi-icon" size={18} />
            </div>
            <div className="admin-kpi-value admin-num">{value}</div>
            <div className="admin-kpi-sub">Manage {label.toLowerCase()}</div>
          </motion.button>
        ))}
      </div>

      {/* Recent projects */}
      <div className="admin-card admin-card-pad">
        <div className="admin-panel-head" style={{ marginBottom: 14 }}>
          <div>
            <div className="admin-page-title" style={{ fontSize: 16 }}>Recent projects</div>
            <div className="admin-page-sub">Your latest additions</div>
          </div>
          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => onNavigate('projects')}>
            View all <ChevronRight size={14} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="admin-empty">
            <FolderOpen className="admin-empty-icon" size={34} />
            <div className="admin-empty-title">No projects yet</div>
            <div className="admin-empty-text">Add your first project to get started.</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {recent.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3"
                style={{
                  padding: '12px 4px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--a-border-soft)',
                }}
              >
                <div
                  style={{
                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                    background: 'var(--a-accent-soft)', border: '1px solid var(--a-accent-border)',
                    overflow: 'hidden', color: 'var(--a-accent)',
                  }}
                >
                  <FolderOpen size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="admin-item-title" style={{ marginBottom: 2 }}>{p.title}</div>
                  <div className="admin-item-desc" style={{ marginBottom: 0, WebkitLineClamp: 1 }}>
                    {p.description || 'No description'}
                  </div>
                </div>
                {p.tags && p.tags.length > 0 && (
                  <span className="admin-chip" style={{ flexShrink: 0 }}>{p.tags[0]}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

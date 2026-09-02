import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, FolderOpen, Award, Sun, Moon, Monitor, UserPlus, TrendingUp, RefreshCw, Database } from 'lucide-react';
import { Menu } from '@headlessui/react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import ProjectsManager     from '../components/ProjectsManager';
import CertificatesManager from '../components/CertificatesManager';
import StatsManager        from '../components/StatsManager';
import RagManager          from '../components/RagManager';
import RegisterAdmin       from '../components/RegisterAdmin';

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';

function StatCard({ label, value, icon: Icon, color, glowColor, delay }) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1,    opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden p-6"
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, transparent 60%), #0a0e1a`,
        border    : `1px solid ${color}25`,
        clipPath  : 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)',
        boxShadow : `0 0 30px ${glowColor}10`,
      }}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-6 h-6 flex items-start justify-end"
        style={{ background: `linear-gradient(135deg, transparent 50%, ${color}20 50%)` }} />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-pixel text-[9px] tracking-widest mb-3" style={{ color: `${color}80` }}>
            {label}
          </p>
          <motion.p
            className="font-pixel text-4xl"
            style={{ color, textShadow: `0 0 20px ${color}40` }}
          >
            {value}
          </motion.p>
        </div>
        <Icon className="w-12 h-12 opacity-10" style={{ color }} />
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
    </motion.div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-5 py-4 font-pixel text-[10px] tracking-widest transition-all duration-200"
      style={{ color: active ? '#4f8cff' : 'rgba(148,163,184,0.4)' }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #4f8cff, transparent)' }}
        />
      )}
    </button>
  );
}

function IconBtn({ onClick, disabled, title, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: 'rgba(79,140,255,0.05)',
        border    : '1px solid rgba(79,140,255,0.12)',
        clipPath  : pixelClip,
        color     : 'rgba(148,163,184,0.6)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(79,140,255,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(79,140,255,0.12)'; }}
    >
      {children}
    </motion.button>
  );
}

export default function Dashboard({ admin, onLogout }) {
  const [activeTab,    setActiveTab]    = useState('projects');
  const [projects,     setProjects]     = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [stats,        setStats]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { theme, changeTheme } = useTheme();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c, s] = await Promise.all([api.getProjects(), api.getCertificates(), api.getStats()]);
      setProjects(p.data || []);
      setCertificates(c.data || []);
      setStats(s.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [p, c, s] = await Promise.all([
        api.getProjects(), api.getCertificates(), api.getStats(),
        new Promise(r => setTimeout(r, 500)),
      ]);
      setProjects(p.data || []);
      setCertificates(c.data || []);
      setStats(s.data || []);
    } catch (err) {
      alert('Failed to refresh: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const themeIcons  = { light: Sun, dark: Moon, system: Monitor };
  const ThemeIcon   = themeIcons[theme];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ background: '#050709' }}
    >
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)', zIndex: 0 }} />

      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 sm:px-8"
        style={{ background: 'rgba(5,7,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(79,140,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Left: title */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#4f8cff]" style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }} />
            <div>
              <h1 className="font-pixel text-xs tracking-widest text-[#e2e8f0]">PORTFOLIO ADMIN</h1>
              <p className="font-mono text-[10px] text-[rgba(148,163,184,0.35)]">
                welcome,<span style={{ color: '#ba8d13' }}> KING </span><span style={{ color: '#4f8cff' }}>{admin.username}</span>
              </p>
            </div>
          </motion.div>

          {/* Right: actions */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2">
            {/* Refresh */}
            <IconBtn onClick={handleRefresh} disabled={refreshing} title="Refresh Data">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#4f8cff]' : ''}`} />
            </IconBtn>

            {/* Theme switcher */}
            <Menu as="div" className="relative">
              <Menu.Button as={motion.button}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="p-2 transition-all duration-200"
                style={{ background: 'rgba(79,140,255,0.05)', border: '1px solid rgba(79,140,255,0.12)', clipPath: pixelClip, color: 'rgba(148,163,184,0.6)' }}
              >
                <ThemeIcon className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items
                className="absolute right-0 mt-2 w-44 py-1 z-50"
                style={{ background: '#0d1220', border: '1px solid rgba(79,140,255,0.15)', clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)' }}
              >
                {['light','dark','system'].map(t => {
                  const Icon = themeIcons[t];
                  return (
                    <Menu.Item key={t}>
                      {({ active }) => (
                        <button
                          onClick={() => changeTheme(t)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 font-pixel text-[9px] tracking-widest transition-colors"
                          style={{ color: theme === t ? '#4f8cff' : active ? 'rgba(148,163,184,0.8)' : 'rgba(148,163,184,0.4)', background: active ? 'rgba(79,140,255,0.05)' : 'transparent' }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {t.toUpperCase()}
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </Menu.Items>
            </Menu>

            {/* Add Admin */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowRegister(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 font-pixel text-[10px] tracking-widest transition-all duration-200"
              style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', clipPath: pixelClip }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}
            >
              <UserPlus className="w-3.5 h-3.5" />
              ADD ADMIN
            </motion.button>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 font-pixel text-[10px] tracking-widest transition-all duration-200"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)', clipPath: pixelClip }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard label="TOTAL PROJECTS"     value={projects.length}     icon={FolderOpen}  color="#4f8cff"  glowColor="#4f8cff"  delay={0.1} />
          <StatCard label="TOTAL CERTIFICATES" value={certificates.length} icon={Award}       color="#00d4ff"  glowColor="#00d4ff"  delay={0.2} />
        </div>

        {/* Tab panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: '#0a0e1a',
            border    : '1px solid rgba(79,140,255,0.12)',
            clipPath  : 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)',
          }}
        >
          {/* Tabs header */}
          <div
            className="flex items-center gap-1 px-2"
            style={{ borderBottom: '1px solid rgba(79,140,255,0.08)', background: 'rgba(79,140,255,0.02)' }}
          >
            <TabBtn active={activeTab === 'projects'}     onClick={() => setActiveTab('projects')}     icon={FolderOpen}  label="PROJECTS"     />
            <TabBtn active={activeTab === 'certificates'} onClick={() => setActiveTab('certificates')} icon={Award}       label="CERTIFICATES" />
            <TabBtn active={activeTab === 'stats'}        onClick={() => setActiveTab('stats')}        icon={TrendingUp}  label="STATS"        />
            <TabBtn active={activeTab === 'rag'}          onClick={() => setActiveTab('rag')}          icon={Database}    label="RAG"          />
          </div>

          {/* Tab content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(79,140,255,0.15)', borderTopColor: '#4f8cff' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#4f8cff] animate-pulse" />
                  </div>
                </div>
                <p className="font-pixel text-[10px] tracking-widest text-[rgba(148,163,184,0.3)]">LOADING DATA...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'projects'     && <ProjectsManager     projects={projects}         onUpdate={loadData} />}
                  {activeTab === 'certificates' && <CertificatesManager certificates={certificates} onUpdate={loadData} />}
                  {activeTab === 'stats'        && <StatsManager        stats={stats}               onUpdate={loadData} />}
                  {activeTab === 'rag'          && <RagManager />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      {/* Register modal */}
      {showRegister && <RegisterAdmin onClose={() => setShowRegister(false)} />}
    </motion.div>
  );
}
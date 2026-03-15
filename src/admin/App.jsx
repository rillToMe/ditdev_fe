import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';
import api from './services/api';
import { ThemeProvider } from './contexts/ThemeContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: '#050709' }}>
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 relative z-10"
      >
        {/* Pixel spinner */}
        <div className="relative w-14 h-14 flex items-center justify-center"
          style={{ background: 'rgba(79,140,255,0.05)', border: '1px solid rgba(79,140,255,0.15)', clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(79,140,255,0.15)', borderTopColor: '#4f8cff' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#4f8cff] animate-pulse" />
          </div>
        </div>

        <p className="font-pixel text-[10px] tracking-widest animate-pulse"
          style={{ color: 'rgba(79,140,255,0.5)' }}>
          LOADING ADMIN PORTAL...
        </p>
      </motion.div>

      {/* Corner tags */}
      <div className="fixed top-4 left-4 font-pixel text-[8px] text-[rgba(79,140,255,0.15)] tracking-widest">ADMIN_PORTAL</div>
      <div className="fixed bottom-4 right-4 font-pixel text-[8px] text-[rgba(79,140,255,0.1)]">v2.0.0</div>
    </div>
  );
}

function AdminApp() {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { verifyAuth(); }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await api.verify();
      setAdmin(data.admin);
    } catch {
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  if (loading) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      {admin
        ? <Dashboard key="dashboard" admin={admin} onLogout={handleLogout} />
        : <Login     key="login"     onLogin={setAdmin} />
      }
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AdminApp />
    </ThemeProvider>
  );
}
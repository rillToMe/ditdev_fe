import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, AlertTriangle, Check, X } from 'lucide-react';
import api from '../services/api';
import Portal from './Portal';

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';

const TYPE_COLORS = {
  project    : '#4f8cff',
  skill      : '#00d4ff',
  certificate: '#fdcb6e',
  education  : '#a29bfe',
  stats      : '#fd79a8',
  about      : '#61dafb',
  contact    : '#55efc4',
};

export default function RagManager() {
  const [state,      setState]      = useState({ loading: true });
  const [rebuilding, setRebuilding] = useState(false);
  const [confirm,    setConfirm]    = useState(false);
  const [result,     setResult]     = useState(null);

  const load = useCallback(async () => {
    setState({ loading: true });
    try {
      setState({ loading: false, ...(await api.getRagStatus()) });
    } catch (err) {
      setState({ loading: false, reachable: false, message: err.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRebuild = async () => {
    setConfirm(false);
    setRebuilding(true);
    setResult(null);
    try {
      const res = await api.rebuildRag();
      setResult({ ok: true, message: res.message });
      await load();
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setRebuilding(false);
    }
  };

  const health   = state.data ?? {};
  const byType   = health.by_type ?? {};
  const degraded = health.status && health.status !== 'ok';

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-pixel text-sm tracking-widest text-[#e2e8f0]">RAG INDEX</h2>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(148,163,184,0.35)' }}>
            Knowledge the chatbot answers from
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={load}
            disabled={state.loading || rebuilding}
            className="flex items-center gap-2 px-4 py-2.5 font-pixel text-[10px] tracking-widest transition-all duration-200 disabled:opacity-40"
            style={{ background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', color: '#4f8cff', clipPath: pixelClip }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${state.loading ? 'animate-spin' : ''}`} />
            REFRESH
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setConfirm(true)}
            disabled={rebuilding || !state.reachable || !state.rebuild_enabled}
            title={
              !state.rebuild_enabled
                ? 'RAG_REBUILD_SECRET is not set on the server'
                : !state.reachable ? 'RAG service is offline' : 'Drop and re-embed every chunk'
            }
            className="flex items-center gap-2 px-5 py-2.5 font-pixel text-[10px] tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'rgba(253,203,110,0.08)', border: '1px solid rgba(253,203,110,0.25)', color: '#fdcb6e', clipPath: pixelClip }}
          >
            <Database className={`w-3.5 h-3.5 ${rebuilding ? 'animate-pulse' : ''}`} />
            {rebuilding ? 'REBUILDING...' : 'REBUILD INDEX'}
          </motion.button>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 px-4 py-3 mb-5 font-mono text-xs"
          style={{
            background: result.ok ? 'rgba(85,239,196,0.06)' : 'rgba(239,68,68,0.06)',
            border    : `1px solid ${result.ok ? 'rgba(85,239,196,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color     : result.ok ? '#55efc4' : 'rgba(239,68,68,0.9)',
            clipPath  : pixelClip,
          }}
        >
          {result.ok ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="break-words">{result.message}</span>
        </motion.div>
      )}

      {state.loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(79,140,255,0.15)', borderTopColor: '#4f8cff' }} />
          <p className="font-pixel text-[10px] tracking-widest" style={{ color: 'rgba(148,163,184,0.3)' }}>
            CHECKING INDEX...
          </p>
        </div>
      ) : !state.reachable ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertTriangle className="w-14 h-14" style={{ color: 'rgba(239,68,68,0.2)' }} />
          <p className="font-pixel text-[10px] tracking-widest" style={{ color: 'rgba(239,68,68,0.6)' }}>
            RAG SERVICE OFFLINE
          </p>
          <p className="font-mono text-[11px] text-center max-w-md break-words" style={{ color: 'rgba(148,163,184,0.4)' }}>
            {state.message}
          </p>
          <p className="font-mono text-[10px] mt-2" style={{ color: 'rgba(148,163,184,0.25)' }}>
            The chatbot still answers, but only from its built-in core information.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="STATUS" value={health.status ?? '—'} color={degraded ? '#fdcb6e' : '#55efc4'} />
            <Metric label="CHUNKS" value={health.chunks ?? 0} color="#4f8cff" />
            <Metric label="DATABASE" value={health.db_ok ? 'connected' : 'down'} color={health.db_ok ? '#55efc4' : 'rgba(239,68,68,0.9)'} />
            <Metric label="CACHED" value={`${health.cache?.size ?? 0}/${health.cache?.maxsize ?? 0}`} color="#a29bfe" />
          </div>

          {/* Embedding model */}
          <div className="px-4 py-3" style={{ background: '#0d1220', border: '1px solid rgba(79,140,255,0.1)', clipPath: pixelClip }}>
            <p className="font-pixel text-[9px] tracking-widest mb-1.5" style={{ color: 'rgba(148,163,184,0.4)' }}>
              EMBEDDING MODEL
            </p>
            <p className="font-mono text-xs" style={{ color: '#00d4ff' }}>{health.embed_model ?? '—'}</p>
            <p className="font-mono text-[10px] mt-1.5" style={{ color: 'rgba(148,163,184,0.3)' }}>
              Changing this model requires a rebuild — the old vectors are not comparable.
            </p>
          </div>

          {/* Chunks by type */}
          <div>
            <p className="font-pixel text-[9px] tracking-widest mb-3" style={{ color: 'rgba(148,163,184,0.4)' }}>
              INDEXED BY TYPE
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byType).length === 0 ? (
                <p className="font-mono text-xs" style={{ color: 'rgba(239,68,68,0.7)' }}>
                  Index is empty — rebuild required.
                </p>
              ) : (
                Object.entries(byType).map(([type, count]) => {
                  const color = TYPE_COLORS[type] ?? '#94a3b8';
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs"
                      style={{ background: `${color}0d`, border: `1px solid ${color}33`, clipPath: pixelClip }}
                    >
                      <span style={{ color }}>{type}</span>
                      <span className="font-pixel text-[10px]" style={{ color }}>{count}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.3)' }}>
            Adding or editing a project or certificate updates the index automatically.
            A full rebuild is only needed after the chunk format itself changes.
          </p>
        </div>
      )}

      {/* Confirm modal — a rebuild empties the collection before re-embedding */}
      {confirm && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md"
              style={{ background: '#0a0e1a', border: '1px solid rgba(253,203,110,0.2)', clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)' }}
            >
              <div className="h-0.5" style={{ background: 'linear-gradient(90deg,transparent,rgba(253,203,110,0.5),transparent)' }} />
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-pixel text-xs tracking-widest text-[#e2e8f0]">// REBUILD_INDEX</h3>
                  <button onClick={() => setConfirm(false)} className="text-[rgba(148,163,184,0.3)] hover:text-[rgba(148,163,184,0.7)] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="font-mono text-xs leading-relaxed mb-3" style={{ color: 'rgba(148,163,184,0.7)' }}>
                  This drops all {health.chunks ?? 0} chunks, then re-embeds them through
                  Cloudflare Workers AI.
                </p>
                <p className="font-mono text-xs leading-relaxed mb-5" style={{ color: 'rgba(253,203,110,0.8)' }}>
                  If embedding fails midway the index is left empty, and the chatbot
                  answers without portfolio data until a rebuild succeeds. Takes up to
                  a minute — do not close this tab.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirm(false)}
                    className="flex-1 py-3 font-pixel text-[9px] tracking-widest border border-[rgba(148,163,184,0.15)] text-[rgba(148,163,184,0.4)] hover:text-[rgba(148,163,184,0.7)] transition-all"
                    style={{ clipPath: pixelClip }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleRebuild}
                    className="flex-1 py-3 font-pixel text-[9px] tracking-widest transition-all duration-200"
                    style={{ background: 'rgba(253,203,110,0.1)', border: '1px solid rgba(253,203,110,0.3)', color: '#fdcb6e', clipPath: pixelClip }}
                  >
                    REBUILD NOW
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="px-4 py-3" style={{ background: '#0d1220', border: '1px solid rgba(79,140,255,0.1)', clipPath: pixelClip }}>
      <p className="font-pixel text-[8px] tracking-widest mb-2" style={{ color: 'rgba(148,163,184,0.4)' }}>
        {label}
      </p>
      <p className="font-pixel text-base" style={{ color }}>{value}</p>
    </div>
  );
}

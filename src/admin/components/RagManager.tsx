import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Database, RefreshCw, AlertTriangle, Check, X } from 'lucide-react'
import api from '../services/api'
import { btn } from '../ui'
import type { RagHealth, RagStatusResponse } from '../../types/api'
import Portal from './Portal'

type RagState = { loading: boolean } & Partial<RagStatusResponse>

interface RagResult {
  ok: boolean
  message: string
}

export default function RagManager() {
  const [state, setState] = useState<RagState>({ loading: true })
  const [rebuilding, setRebuilding] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<RagResult | null>(null)

  const load = useCallback(async () => {
    setState({ loading: true })
    try {
      setState({ loading: false, ...(await api.getRagStatus()) })
    } catch (err) {
      setState({ loading: false, reachable: false, message: err instanceof Error ? err.message : 'RAG status check failed' })
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRebuild = async () => {
    setConfirm(false)
    setRebuilding(true)
    setResult(null)
    try {
      const res = await api.rebuildRag()
      setResult({ ok: true, message: res.message || 'Index rebuilt' })
      await load()
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Rebuild failed' })
    } finally {
      setRebuilding(false)
    }
  }

  const health: RagHealth = state.data ?? {}
  const byType: Record<string, number> = health.by_type ?? {}
  const degraded = health.status && health.status !== 'ok'

  return (
    <>
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-page-title">RAG Index</h2>
          <p className="admin-page-sub">Knowledge the chatbot answers from</p>
        </div>
        <div className="admin-panel-actions">
          <button className={btn.ghost} onClick={load} disabled={state.loading || rebuilding}>
            <RefreshCw size={15} className={state.loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            className={btn.primary}
            onClick={() => setConfirm(true)}
            disabled={rebuilding || !state.reachable || !state.rebuild_enabled}
            title={
              !state.rebuild_enabled
                ? 'RAG_REBUILD_SECRET is not set on the server'
                : !state.reachable ? 'RAG service is offline' : 'Drop and re-embed every chunk'
            }
          >
            <Database size={15} className={rebuilding ? 'animate-pulse' : ''} />
            {rebuilding ? 'Rebuilding…' : 'Rebuild index'}
          </button>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 mb-5"
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--a-radius-sm)',
            fontSize: 13,
            background: result.ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1px solid ${result.ok ? 'rgba(52,211,153,0.28)' : 'rgba(248,113,113,0.28)'}`,
            color: result.ok ? 'var(--a-green)' : 'var(--a-red)',
          }}
        >
          {result.ok ? <Check size={16} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
          <span style={{ wordBreak: 'break-word' }}>{result.message}</span>
        </motion.div>
      )}

      {state.loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Checking index…</p>
        </div>
      ) : !state.reachable ? (
        <div className="admin-empty">
          <AlertTriangle className="admin-empty-icon" size={40} style={{ color: 'var(--a-red)' }} />
          <div className="admin-empty-title" style={{ color: 'var(--a-red)' }}>RAG service offline</div>
          <div className="admin-empty-text" style={{ wordBreak: 'break-word' }}>{state.message}</div>
          <div className="admin-empty-text" style={{ fontSize: 12 }}>
            The chatbot still answers, but only from its built-in core information.
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Status" value={health.status ?? '—'} color={degraded ? 'var(--a-amber)' : 'var(--a-green)'} />
            <Metric label="Chunks" value={health.chunks ?? 0} color="var(--a-accent)" />
            <Metric label="Database" value={health.db_ok ? 'Connected' : 'Down'} color={health.db_ok ? 'var(--a-green)' : 'var(--a-red)'} />
            <Metric label="Cached" value={`${health.cache?.size ?? 0}/${health.cache?.maxsize ?? 0}`} color="var(--a-text-dim)" />
          </div>

          {/* Embedding model */}
          <div className="admin-card admin-card-pad">
            <div className="admin-section-label" style={{ marginBottom: 8 }}>Embedding model</div>
            <p style={{ fontSize: 13.5, color: 'var(--a-text)', fontWeight: 500 }}>{health.embed_model ?? '—'}</p>
            <p className="admin-hint">
              Changing this model requires a rebuild — the old vectors are not comparable.
            </p>
          </div>

          {/* Chunks by type */}
          <div>
            <div className="admin-section-label" style={{ marginBottom: 12 }}>Indexed by type</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byType).length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--a-red)' }}>
                  Index is empty — rebuild required.
                </p>
              ) : (
                Object.entries(byType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center gap-2"
                    style={{
                      padding: '5px 11px',
                      borderRadius: 6,
                      background: 'var(--a-surface-2)',
                      border: '1px solid var(--a-border)',
                      fontSize: 12.5,
                    }}
                  >
                    <span style={{ color: 'var(--a-text-dim)', fontWeight: 500 }}>{type}</span>
                    <span className="admin-num" style={{ color: 'var(--a-text)', fontWeight: 600 }}>{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="admin-hint" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
            Adding or editing a project or certificate updates the index automatically.
            A full rebuild is only needed after the chunk format itself changes.
          </p>
        </div>
      )}

      {/* Confirm modal — a rebuild empties the collection before re-embedding */}
      {confirm && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="admin-overlay"
            onClick={() => setConfirm(false)}
          >
            <div className="admin-overlay-backdrop" />
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="admin-modal"
              style={{ maxWidth: 460 }}
            >
              <div className="admin-modal-head">
                <h3 className="admin-modal-title">Rebuild index</h3>
                <button className="admin-iconbtn" style={{ width: 32, height: 32 }} onClick={() => setConfirm(false)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div className="admin-modal-body space-y-3">
                <p style={{ fontSize: 13.5, color: 'var(--a-text-dim)', lineHeight: 1.65 }}>
                  This drops all {health.chunks ?? 0} chunks, then re-embeds them through
                  Cloudflare Workers AI.
                </p>
                <div className="admin-alert" style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.28)', color: '#fcd34d' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    If embedding fails midway the index is left empty, and the chatbot answers
                    without portfolio data until a rebuild succeeds. Takes up to a minute — do
                    not close this tab.
                  </span>
                </div>
              </div>

              <div className="admin-modal-foot">
                <button className={btn.ghost + ' flex-1'} onClick={() => setConfirm(false)}>
                  Cancel
                </button>
                <button className={btn.primary + ' flex-1'} onClick={handleRebuild}>
                  Rebuild now
                </button>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </>
  )
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="admin-card admin-card-pad" style={{ padding: 16 }}>
      <div className="admin-section-label" style={{ fontSize: 10.5, marginBottom: 8 }}>{label}</div>
      <p className="admin-num" style={{ fontSize: 17, fontWeight: 700, color }}>{value}</p>
    </div>
  )
}

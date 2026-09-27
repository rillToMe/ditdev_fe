import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, TrendingUp, Save, X, Calendar } from 'lucide-react'
import api from '../services/api'
import { btn, inputCls, labelCls, badge } from '../ui'
import type { Stat, StatInput } from '../../types/api'
import Portal from './Portal'

const isAutoCalc = (key: string) => key === 'months_studying'

interface StatsManagerProps {
  stats: Stat[]
  onUpdate: () => void
}

export default function StatsManager({ stats, onUpdate }: StatsManagerProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editData, setEditData] = useState({ value: 0, label: '', start_date: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [newStat, setNewStat] = useState({ key: '', value: 0, label: '', start_date: '' })

  const handleEdit = (stat: Stat) => {
    setEditingKey(stat.key)
    setEditData({ value: stat.value ?? 0, label: stat.label, start_date: stat.start_date || '' })
  }

  const handleSave = async (key: string) => {
    try {
      const data: StatInput = { label: editData.label }
      if (isAutoCalc(key) && editData.start_date) data.start_date = editData.start_date
      else data.value = editData.value
      await api.updateStat(key, data)
      setEditingKey(null)
      onUpdate()
    } catch (err) { alert('Failed to update: ' + (err instanceof Error ? err.message : err)) }
  }

  const handleDelete = async (key: string) => {
    if (!confirm('Delete this stat?')) return
    try { await api.deleteStat(key); onUpdate() }
    catch (err) { alert('Failed to delete: ' + (err instanceof Error ? err.message : err)) }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data: StatInput = { key: newStat.key, label: newStat.label }
      if (newStat.key === 'months_studying' && newStat.start_date) data.start_date = newStat.start_date
      else data.value = newStat.value
      await api.createStat(data)
      setShowAdd(false)
      setNewStat({ key: '', value: 0, label: '', start_date: '' })
      onUpdate()
    } catch (err) { alert('Failed to add: ' + (err instanceof Error ? err.message : err)) }
  }

  return (
    <>
      {/* Header */}
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-page-title">Stats</h2>
          <p className="admin-page-sub">Numbers displayed in the About section</p>
        </div>
        <button className={btn.primary} onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          New stat
        </button>
      </div>

      {stats.length === 0 ? (
        <div className="admin-empty">
          <TrendingUp className="admin-empty-icon" size={40} />
          <div className="admin-empty-title">No stats yet</div>
          <div className="admin-empty-text">Add a stat to display it in the About section.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="admin-card admin-card-pad"
            >
              {editingKey === stat.key ? (
                // Edit mode
                <div className="space-y-4">
                  {isAutoCalc(stat.key) ? (
                    <div>
                      <label className={labelCls}>Start date (auto-calc)</label>
                      <input
                        type="date"
                        value={editData.start_date}
                        onChange={(e) => setEditData(p => ({ ...p, start_date: e.target.value }))}
                        className={inputCls}
                      />
                      <p className="admin-hint">Months are calculated from this date.</p>
                    </div>
                  ) : (
                    <div>
                      <label className={labelCls}>Value</label>
                      <input
                        type="number"
                        value={editData.value}
                        onChange={(e) => setEditData(p => ({ ...p, value: parseInt(e.target.value) || 0 }))}
                        className={inputCls + ' admin-num'}
                        style={{ fontSize: 20, fontWeight: 700 }}
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>Label</label>
                    <input
                      type="text"
                      value={editData.label}
                      onChange={(e) => setEditData(p => ({ ...p, label: e.target.value }))}
                      className={inputCls}
                      placeholder="Label"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button className={btn.primarySm + ' flex-1'} onClick={() => handleSave(stat.key)}>
                      <Save size={14} /> Save
                    </button>
                    <button className={btn.ghostSm + ' flex-1'} onClick={() => setEditingKey(null)}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="text-center" style={{ marginBottom: 20 }}>
                    <p className="admin-num" style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, color: 'var(--a-text)' }}>
                      {stat.value}<span style={{ fontSize: 22, opacity: 0.5 }}>+</span>
                    </p>
                    <p style={{ fontSize: 13.5, color: 'var(--a-text-dim)', marginTop: 10 }}>{stat.label}</p>
                    <div className="flex items-center justify-center gap-2" style={{ marginTop: 8 }}>
                      <span className="admin-page-sub" style={{ fontSize: 11.5 }}>{stat.key}</span>
                      {stat.start_date && (
                        <span className={badge.accent} style={{ fontSize: 10.5 }}>
                          <Calendar size={11} /> Auto
                        </span>
                      )}
                    </div>
                    {stat.start_date && (
                      <p className="admin-page-sub" style={{ fontSize: 11.5, marginTop: 6 }}>
                        since {new Date(stat.start_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className={btn.ghostSm + ' flex-1'} onClick={() => handleEdit(stat)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className={btn.dangerSm + ' flex-1'} onClick={() => handleDelete(stat.key)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Stat Modal */}
      <AnimatePresence>
        {showAdd && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-overlay"
              onClick={() => setShowAdd(false)}
            >
              <div className="admin-overlay-backdrop" />
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="admin-modal"
                style={{ maxWidth: 460 }}
              >
                <div className="admin-modal-head">
                  <h3 className="admin-modal-title">New stat</h3>
                  <button className="admin-iconbtn" style={{ width: 32, height: 32 }} onClick={() => setShowAdd(false)} aria-label="Close">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAdd}>
                  <div className="admin-modal-body space-y-4">
                    <div>
                      <label className={labelCls}>Key *</label>
                      <input
                        type="text"
                        value={newStat.key}
                        onChange={(e) => setNewStat(p => ({ ...p, key: e.target.value }))}
                        className={inputCls}
                        placeholder="stat_key"
                        required
                      />
                      {newStat.key === 'months_studying' && (
                        <p className="admin-hint">This key auto-calculates the month count from a start date.</p>
                      )}
                    </div>

                    {newStat.key === 'months_studying' ? (
                      <div>
                        <label className={labelCls}>Start date *</label>
                        <input
                          type="date"
                          value={newStat.start_date}
                          onChange={(e) => setNewStat(p => ({ ...p, start_date: e.target.value }))}
                          className={inputCls}
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className={labelCls}>Value *</label>
                        <input
                          type="number"
                          value={newStat.value}
                          onChange={(e) => setNewStat(p => ({ ...p, value: parseInt(e.target.value) || 0 }))}
                          className={inputCls + ' admin-num'}
                          placeholder="0"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className={labelCls}>Label *</label>
                      <input
                        type="text"
                        value={newStat.label}
                        onChange={(e) => setNewStat(p => ({ ...p, label: e.target.value }))}
                        className={inputCls}
                        placeholder="Projects Completed"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-modal-foot">
                    <button type="button" className={btn.ghost + ' flex-1'} onClick={() => setShowAdd(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={btn.primary + ' flex-1'}>
                      Create stat
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  )
}

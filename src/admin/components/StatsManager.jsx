import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, TrendingUp, Save, X, Calendar } from 'lucide-react';
import api from '../services/api';
import Portal from './Portal';

const pixelClip = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';

const dateInputStyle = `
  .pixel-date::-webkit-calendar-picker-indicator {
    filter: invert(0.6) sepia(1) saturate(3) hue-rotate(180deg) brightness(1.2);
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
    opacity: 0.7;
  }
  .pixel-date::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
    filter: invert(0.8) sepia(1) saturate(4) hue-rotate(180deg) brightness(1.4);
  }
  .pixel-date::-webkit-inner-spin-button { display: none; }
`;

const inputClass = [
  'w-full px-4 py-2.5 text-sm font-mono',
  'bg-[#070a14] border border-[rgba(79,140,255,0.15)]',
  'text-[#e2e8f0] placeholder-[rgba(148,163,184,0.3)]',
  'focus:outline-none focus:border-[rgba(79,140,255,0.4)]',
  'transition-all duration-200',
].join(' ');

const labelClass = 'block font-pixel text-[9px] tracking-widest text-[rgba(148,163,184,0.5)] mb-1.5 uppercase';

const isAutoCalc = (key) => key === 'months_studying';

export default function StatsManager({ stats, onUpdate }) {
  const [editingKey, setEditingKey] = useState(null);
  const [editData,   setEditData]   = useState({ value: 0, label: '', start_date: '' });
  const [showAdd,    setShowAdd]    = useState(false);
  const [newStat,    setNewStat]    = useState({ key: '', value: 0, label: '', start_date: '' });

  const handleEdit = (stat) => {
    setEditingKey(stat.key);
    setEditData({ value: stat.value, label: stat.label, start_date: stat.start_date || '' });
  };

  const handleSave = async (key) => {
    try {
      const data = { label: editData.label };
      if (isAutoCalc(key) && editData.start_date) data.start_date = editData.start_date;
      else data.value = editData.value;
      await api.updateStat(key, data);
      setEditingKey(null);
      onUpdate();
    } catch (err) { alert('Failed to update: ' + err.message); }
  };

  const handleDelete = async (key) => {
    if (!confirm('Delete this stat?')) return;
    try { await api.deleteStat(key); onUpdate(); }
    catch (err) { alert('Failed to delete: ' + err.message); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const data = { key: newStat.key, label: newStat.label };
      if (newStat.key === 'months_studying' && newStat.start_date) data.start_date = newStat.start_date;
      else data.value = newStat.value;
      await api.createStat(data);
      setShowAdd(false);
      setNewStat({ key: '', value: 0, label: '', start_date: '' });
      onUpdate();
    } catch (err) { alert('Failed to add: ' + err.message); }
  };

  return (
    <>
      <style>{dateInputStyle}</style>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-pixel text-sm tracking-widest text-[#e2e8f0]">STATS</h2>
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(148,163,184,0.35)' }}>
            Displayed in About section
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 font-pixel text-[10px] tracking-widest transition-all duration-200"
          style={{ background: 'rgba(162,155,254,0.08)', border: '1px solid rgba(162,155,254,0.25)', color: '#a29bfe', clipPath: pixelClip }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(162,155,254,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(162,155,254,0.08)'}
        >
          <Plus className="w-3.5 h-3.5" />
          NEW STAT
        </motion.button>
      </div>

      {stats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <TrendingUp className="w-16 h-16" style={{ color: 'rgba(162,155,254,0.15)' }} />
          <p className="font-pixel text-[10px] tracking-widest" style={{ color: 'rgba(148,163,184,0.3)' }}>NO STATS YET</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: index * 0.06 }}
              className="p-5 relative overflow-hidden"
              style={{
                background: '#0d1220',
                border    : '1px solid rgba(162,155,254,0.1)',
                clipPath  : 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)',
              }}
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(162,155,254,0.3),transparent)' }} />

              {editingKey === stat.key ? (
                // Edit mode
                <div className="space-y-3">
                  {isAutoCalc(stat.key) ? (
                    <div>
                      <label className={labelClass}>Start Date (auto-calc)</label>
                      <input type="date" value={editData.start_date}
                        onChange={e => setEditData(p => ({ ...p, start_date: e.target.value }))}
                        className={inputClass + ' pixel-date'} style={{ clipPath: pixelClip }} />
                      <p className="mt-1.5 font-mono text-[9px]" style={{ color: 'rgba(162,155,254,0.4)' }}>
                        Months calculated from this date
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className={labelClass}>Value</label>
                      <input type="number" value={editData.value}
                        onChange={e => setEditData(p => ({ ...p, value: parseInt(e.target.value) || 0 }))}
                        className={inputClass + ' text-center text-xl font-pixel'} style={{ clipPath: pixelClip }} />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Label</label>
                    <input type="text" value={editData.label}
                      onChange={e => setEditData(p => ({ ...p, label: e.target.value }))}
                      className={inputClass + ' text-center'} style={{ clipPath: pixelClip }} placeholder="Label" />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleSave(stat.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200"
                      style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', clipPath: pixelClip }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
                    >
                      <Save className="w-3 h-3" /> SAVE
                    </button>
                    <button onClick={() => setEditingKey(null)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200"
                      style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.15)', color: 'rgba(148,163,184,0.5)', clipPath: pixelClip }}
                    >
                      <X className="w-3 h-3" /> CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="text-center mb-5">
                    <motion.p className="font-pixel text-5xl mb-2"
                      style={{ color: '#a29bfe', textShadow: '0 0 20px rgba(162,155,254,0.3)' }}>
                      {stat.value}<span className="text-2xl opacity-50">+</span>
                    </motion.p>
                    <p className="font-mono text-sm" style={{ color: 'rgba(148,163,184,0.7)' }}>
                      {stat.label}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <p className="font-mono text-[9px]" style={{ color: 'rgba(148,163,184,0.25)' }}>
                        {stat.key}
                      </p>
                      {stat.start_date && (
                        <span className="flex items-center gap-1 px-2 py-0.5 font-pixel text-[8px]"
                          style={{ background: 'rgba(162,155,254,0.08)', border: '1px solid rgba(162,155,254,0.2)', color: 'rgba(162,155,254,0.6)', clipPath: pixelClip }}>
                          <Calendar className="w-2.5 h-2.5" /> AUTO
                        </span>
                      )}
                    </div>
                    {stat.start_date && (
                      <p className="font-mono text-[9px] mt-1" style={{ color: 'rgba(148,163,184,0.25)' }}>
                        since {new Date(stat.start_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(stat)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200"
                      style={{ background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', color: '#4f8cff', clipPath: pixelClip }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,140,255,0.14)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,140,255,0.06)'}
                    >
                      <Edit className="w-3 h-3" /> EDIT
                    </button>
                    <button onClick={() => handleDelete(stat.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 font-pixel text-[9px] tracking-widest transition-all duration-200"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.6)', clipPath: pixelClip }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                    >
                      <Trash2 className="w-3 h-3" /> DELETE
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdd(false)}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md"
              style={{ background: '#0a0e1a', border: '1px solid rgba(162,155,254,0.18)', clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)' }}
            >
              <div className="h-0.5" style={{ background: 'linear-gradient(90deg,transparent,rgba(162,155,254,0.5),transparent)' }} />
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-pixel text-xs tracking-widest text-[#e2e8f0]">// NEW_STAT</h3>
                  <button onClick={() => setShowAdd(false)} className="text-[rgba(148,163,184,0.3)] hover:text-[rgba(148,163,184,0.7)] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className={labelClass}>Key *</label>
                    <input type="text" value={newStat.key}
                      onChange={e => setNewStat(p => ({ ...p, key: e.target.value }))}
                      className={inputClass} style={{ clipPath: pixelClip }}
                      placeholder="stat_key" required />
                    {newStat.key === 'months_studying' && (
                      <p className="mt-1.5 font-mono text-[9px]" style={{ color: 'rgba(162,155,254,0.5)' }}>
                        💡 This key will auto-calculate months
                      </p>
                    )}
                  </div>

                  {newStat.key === 'months_studying' ? (
                    <div>
                      <label className={labelClass}>Start Date *</label>
                      <input type="date" value={newStat.start_date}
                        onChange={e => setNewStat(p => ({ ...p, start_date: e.target.value }))}
                        className={inputClass + ' pixel-date'} style={{ clipPath: pixelClip }} required />
                    </div>
                  ) : (
                    <div>
                      <label className={labelClass}>Value *</label>
                      <input type="number" value={newStat.value}
                        onChange={e => setNewStat(p => ({ ...p, value: parseInt(e.target.value) || 0 }))}
                        className={inputClass} style={{ clipPath: pixelClip }}
                        placeholder="0" required />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Label *</label>
                    <input type="text" value={newStat.label}
                      onChange={e => setNewStat(p => ({ ...p, label: e.target.value }))}
                      className={inputClass} style={{ clipPath: pixelClip }}
                      placeholder="Projects Completed" required />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAdd(false)}
                      className="flex-1 py-3 font-pixel text-[9px] tracking-widest border border-[rgba(148,163,184,0.15)] text-[rgba(148,163,184,0.4)] hover:text-[rgba(148,163,184,0.7)] transition-all"
                      style={{ clipPath: pixelClip }}>
                      CANCEL
                    </button>
                    <button type="submit"
                      className="flex-1 py-3 font-pixel text-[9px] tracking-widest transition-all duration-200"
                      style={{ background: 'rgba(162,155,254,0.1)', border: '1px solid rgba(162,155,254,0.3)', color: '#a29bfe', clipPath: pixelClip }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(162,155,254,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(162,155,254,0.1)'}
                    >
                      CREATE STAT
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
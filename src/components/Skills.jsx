import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SiUnity, SiGodotengine, SiUnrealengine, SiBlender,
  SiReact, SiJavascript, SiNodedotjs, SiHtml5, SiPostgresql,
  SiGithub,
} from 'react-icons/si';
import { FiCode } from 'react-icons/fi';
import { DiVisualstudio } from 'react-icons/di'
import { BiLogoVisualStudio } from "react-icons/bi";
import { TbBrandCSharp } from "react-icons/tb";
import { LuInfinity } from "react-icons/lu";


// Constellation
const SKILLS = [
  { id: 'unity',      label: 'Unity',         icon: SiUnity,        category: 'gamedev',  x: 0.22, y: 0.28, tier: 'legendary',    connects: ['csharp','godot','blender'] },
  { id: 'godot',      label: 'Godot',         icon: SiGodotengine,  category: 'gamedev',  x: 0.12, y: 0.52, tier: 'advanced',     connects: ['unity','blender', 'csharp'] },
  { id: 'unreal',     label: 'Unreal Engine', icon: SiUnrealengine, category: 'gamedev',  x: 0.30, y: 0.68, tier: 'apprentice',   connects: ['unity','blender'] },
  { id: 'vs',         label: 'VisualStudio',  icon: DiVisualstudio,         category: 'tools',    x: 0.48, y: 0.47, tier: 'legendary',    connects: ['unity','unreal', 'csharp', 'github'] },
  { id: 'blender',    label: 'Blender',       icon: SiBlender,      category: 'design',   x: 0.10, y: 0.78, tier: 'advanced',     connects: ['unity','godot','unreal'] },
  { id: 'csharp',     label: 'C#',            icon: TbBrandCSharp,         category: 'language', x: 0.40, y: 0.25, tier: 'legendary',    connects: ['unity','javascript', 'vscode'] },
  { id: 'javascript', label: 'JavaScript',    icon: SiJavascript,   category: 'language', x: 0.58, y: 0.25, tier: 'advanced',     connects: ['csharp','react','nodejs','html'] },
  { id: 'react',      label: 'React',         icon: SiReact,        category: 'web',      x: 0.74, y: 0.18, tier: 'advanced',     connects: ['javascript','html','nodejs'] },
  { id: 'html',       label: 'HTML/CSS',      icon: SiHtml5,        category: 'web',      x: 0.84, y: 0.42, tier: 'legendary',    connects: ['react','javascript', 'vscode', 'vs', 'nodejs'] },
  { id: 'nodejs',     label: 'Node.js',       icon: SiNodedotjs,    category: 'web',      x: 0.69, y: 0.550, tier: 'advanced',     connects: ['javascript','react','postgresql'] },
  { id: 'postgresql', label: 'PostgreSQL',    icon: SiPostgresql,   category: 'database', x: 0.55, y: 0.74, tier: 'intermediate', connects: ['nodejs'] },
  { id: 'github',     label: 'GitHub',        icon: SiGithub,       category: 'tools',    x: 0.40, y: 0.84, tier: 'advanced',     connects: ['unity','react','nodejs', 'unreal', 'godot', 'vscode', 'vs'] },
  { id: 'vscode',     label: 'VS Code',       icon: BiLogoVisualStudio,         category: 'tools',    x: 0.80, y: 0.74, tier: 'legendary',    connects: ['javascript','react', 'nodejs'] },
];

const CATEGORIES = [
  { id: 'all',      label: 'All Stars' },
  { id: 'gamedev',  label: 'Game Dev'  },
  { id: 'language', label: 'Language'  },
  { id: 'web',      label: 'Web'       },
  { id: 'design',   label: 'Design'    },
  { id: 'database', label: 'Database'  },
  { id: 'tools',    label: 'Tools'     },
];

const TIER_CONFIG = {
  legendary:    { color: '#ffd700', glow: '#ffd70066', label: 'Legendary',    size: 7   },
  advanced:     { color: '#00d4ff', glow: '#00d4ff55', label: 'Advanced',     size: 5.5 },
  intermediate: { color: '#4f8cff', glow: '#4f8cff44', label: 'Intermediate', size: 4.5 },
  apprentice:   { color: '#8b9cc8', glow: '#8b9cc833', label: 'Apprentice',   size: 3.5 },
};

const CATEGORY_COLORS = {
  gamedev : '#ff6b6b',
  language: '#ffd700',
  web     : '#00d4ff',
  design  : '#ff9f43',
  database: '#a29bfe',
  tools   : '#55efc4',
};

// xp bar
const XP_API = import.meta.env.VITE_API_URL || '/api';

function XPBar() {
  const [totalXp,  setTotalXp]  = useState(null);
  const [gainAnim, setGainAnim] = useState(null);
  const [offset,   setOffset]   = useState(0);
  const tickRef = useRef(null);
  const rafRef  = useRef(null);
  const xpRef   = useRef(26000); 

  //Fetch initial XP from the backend
  useEffect(() => {
    fetch(`${XP_API}/xp`)
      .then(r => r.json())
      .then(d => {
        const v = d.success ? d.total_xp : 26000;
        xpRef.current = v;
        setTotalXp(v);
      })
      .catch(() => { xpRef.current = 26000; setTotalXp(26000); });
  }, []);

  // Tick loop 
  useEffect(() => {
    const tick = () => {
      fetch(`${XP_API}/xp/tick`, { method: 'POST' })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.total_xp) {
            xpRef.current = d.total_xp;
            setTotalXp(d.total_xp);
            if (!d.rate_limited && d.gain) {
              setGainAnim(`+${d.gain} XP`);
              setTimeout(() => setGainAnim(null), 1200);
              setOffset(p => p + d.gain * 0.6);
            }
          }
        })
        .catch(() => {
          // API down - increment lokal
          const gain = Math.floor(Math.random() * 4) + 1;
          xpRef.current += gain;
          setTotalXp(xpRef.current);
          setGainAnim(`+${gain} XP`);
          setTimeout(() => setGainAnim(null), 1200);
          setOffset(p => p + gain * 0.6);
        });
      tickRef.current = setTimeout(tick, 2000 + Math.random() * 2000);
    };
    tickRef.current = setTimeout(tick, 2000 + Math.random() * 1500);
    return () => clearTimeout(tickRef.current);
  }, []); 

  // RAF shimmer
  useEffect(() => {
    const animate = () => {
      setOffset(prev => prev + 0.04);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const gradientPos = offset % 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 p-5 border border-pixel-blue/15 bg-bg-card/20 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-pixel text-yellow-400 text-xs">DEVELOPER EXP</p>
           <span className="font-pixel text-[10px] px-1 py-0.5 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 flex items-center gap-1">
            LVL
            <LuInfinity size={10} className="relative -top-[1px]" />
          </span>
          </div>
          <p className="font-mono text-pixel-gray/40 text-[10px] mt-1 max-w-xs leading-relaxed">
            Technology evolves every day. There is no max level.
          </p>
        </div>

        {/* Total XP counter */}
        <div className="text-right relative flex-shrink-0">
          <motion.p
            key={totalXp}
            initial={{ opacity: 0.5, y: -4 }}
            animate={{ opacity: 1,   y: 0   }}
            className="font-pixel text-yellow-400/60 text-[10px]"
          >
            {totalXp === null ? '...' : totalXp.toLocaleString()} XP
          </motion.p>
          <p className="font-mono text-pixel-gray/30 text-[9px]">& counting</p>

          {/* Floating gain text */}
          <AnimatePresence>
            {gainAnim && (
              <motion.p
                key={gainAnim + totalXp}
                initial={{ opacity: 1, y: 0   }}
                animate={{ opacity: 0, y: -20 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1 }}
                className="absolute right-0 font-pixel text-yellow-300 text-[10px] pointer-events-none whitespace-nowrap"
                style={{ top: '-22px' }}
              >
                {gainAnim}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Infinite bar */}
<div className="h-4 bg-bg-hover border border-yellow-400/15 relative overflow-hidden">

  {/* Smooth moving gold gradient */}
  <div
    className="absolute inset-0"
    style={{
      background: `
        linear-gradient(
          90deg,
          #5c4a00 0%,
          #ffd700 20%,
          #fff3a0 35%,
          #ffd700 50%,
          #caa300 65%,
          #ffd700 80%,
          #5c4a00 100%
        )
      `,
      backgroundSize: "300% 100%",
      backgroundPositionX: `${gradientPos}%`,
      transition: "background-position 0.1s linear"
    }}
  />

  {/* Moving white shine */}
  <motion.div
    className="absolute inset-y-0 w-24 pointer-events-none"
    animate={{ left: ["-20%", "120%"] }}
    transition={{
      duration: 3,
      ease: "linear",
      repeat: Infinity
    }}
    style={{
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)"
    }}
  />

  {/* Pixel segmentation overlay */}
  <div className="absolute inset-0 flex gap-px opacity-15 pointer-events-none">
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className="flex-1 border-r border-black/50" />
    ))}
  </div>

  {/* Infinity label */}
  <div className="absolute inset-0 flex items-center justify-end pr-2 pointer-events-none">
    <span className="font-pixel text-yellow-400/40 text-[9px]">∞</span>
  </div>

</div>

      {/* Footer quote */}
      <div className="flex items-center justify-between mt-2.5">
        <p className="font-mono text-pixel-gray/50 text-[9px] italic leading-relaxed max-w-[70%]">
          "A new update may rewrite everything you know."
        </p>
        <p className="font-pixel text-yellow-400/45 text-[8px]">ALWAYS LEARNING</p>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef      = useRef(0);

  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredSkill,   setHoveredSkill]   = useState(null);
  const [canvasSize,     setCanvasSize]      = useState({ w: 800, h: 480 });

  const getPos    = useCallback((skill, w, h) => ({ x: skill.x * w, y: skill.y * h }), []);
  const isVisible = useCallback((skill) =>
    activeCategory === 'all' || skill.category === activeCategory,
  [activeCategory]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = canvasSize;
    timeRef.current += 0.012;
    const t = timeRef.current;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 130; i++) {
      const bx = ((Math.sin(i * 127.1) * 0.5 + 0.5)) * w;
      const by = ((Math.sin(i * 311.7) * 0.5 + 0.5)) * h;
      const br = 0.4 + Math.sin(i * 43.7 + t * 0.4) * 0.25;
      const ba = 0.10 + Math.sin(i * 91.3 + t * 0.25) * 0.06;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,255,${ba})`;
      ctx.fill();
    }

    const drawn = new Set();
    SKILLS.forEach(skill => {
      if (!isVisible(skill)) return;
      skill.connects.forEach(targetId => {
        const key = [skill.id, targetId].sort().join('|');
        if (drawn.has(key)) return;
        drawn.add(key);
        const target = SKILLS.find(s => s.id === targetId);
        if (!target || !isVisible(target)) return;
        const from    = getPos(skill, w, h);
        const to      = getPos(target, w, h);
        const isHov   = hoveredSkill === skill.id || hoveredSkill === targetId;
        const alpha   = isHov ? 0.6 : 0.11 + Math.sin(t + skill.id.length) * 0.03;
        const catCol  = CATEGORY_COLORS[skill.category]  || '#4f8cff';
        const catCol2 = CATEGORY_COLORS[target.category] || catCol;
        const toHex   = (a) => Math.round(a * 255).toString(16).padStart(2, '0');
        const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        grad.addColorStop(0, `${catCol}${toHex(alpha)}`);
        grad.addColorStop(1, `${catCol2}${toHex(alpha)}`);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = isHov ? 1.5 : 0.7;
        ctx.stroke();
        if (isHov) {
          const p  = (Math.sin(t * 2.2) * 0.5 + 0.5);
          const dx = from.x + (to.x - from.x) * p;
          const dy = from.y + (to.y - from.y) * p;
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = catCol; ctx.shadowColor = catCol; ctx.shadowBlur = 6;
          ctx.fill(); ctx.shadowBlur = 0;
        }
      });
    });

    SKILLS.forEach(skill => {
      const visible  = isVisible(skill);
      const pos      = getPos(skill, w, h);
      const tier     = TIER_CONFIG[skill.tier];
      const isHov    = hoveredSkill === skill.id;
      const catColor = CATEGORY_COLORS[skill.category] || tier.color;
      const pulse    = 1 + Math.sin(t * 1.4 + skill.id.length * 0.8) * 0.12;
      const radius   = tier.size * (isHov ? 1.6 : 1) * pulse;
      if (visible) {
        const glowR = radius * 4;
        const glow  = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
        glow.addColorStop(0, `${catColor}${Math.round(0.28 * 255).toString(16).padStart(2,'0')}`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = visible ? (isHov ? '#ffffff' : catColor) : 'rgba(80,100,140,0.25)';
      if (visible && isHov) { ctx.shadowColor = catColor; ctx.shadowBlur = 18; }
      ctx.fill(); ctx.shadowBlur = 0;
      if (isHov) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 5 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = `${catColor}88`; ctx.lineWidth = 1; ctx.stroke();
      }
      if (visible) {
        ctx.save();
        ctx.font      = `${isHov ? 'bold ' : ''}${isHov ? 12 : 10}px "JetBrains Mono", monospace`;
        ctx.fillStyle = isHov ? '#ffffff' : 'rgba(170,195,230,0.72)';
        ctx.textAlign = 'center';
        const labelY  = pos.y > h * 0.82 ? pos.y - radius - 7 : pos.y + radius + 13;
        ctx.fillText(skill.label, pos.x, labelY);
        ctx.restore();
      }
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, [canvasSize, hoveredSkill, isVisible, getPos]);

  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      const h = Math.min(Math.max(width * 0.56, 300), 520);
      setCanvasSize({ w: Math.floor(width), h: Math.floor(h) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx   = (e.clientX - rect.left) * (canvasSize.w / rect.width);
    const my   = (e.clientY - rect.top)  * (canvasSize.h / rect.height);
    let found = null, minD = Infinity;
    SKILLS.forEach(skill => {
      if (!isVisible(skill)) return;
      const pos  = getPos(skill, canvasSize.w, canvasSize.h);
      const d    = Math.hypot(mx - pos.x, my - pos.y);
      const tier = TIER_CONFIG[skill.tier];
      if (d < tier.size * 3 + 10 && d < minD) { minD = d; found = skill.id; }
    });
    setHoveredSkill(found);
  }, [canvasSize, isVisible, getPos]);

  const hovered = SKILLS.find(s => s.id === hoveredSkill);

  return (
    <section id="skills" className="py-20 px-4 relative">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-px bg-pixel-blue/40" />
          <p className="font-pixel text-pixel-blue/60 text-[9px] tracking-widest">// 4. SKILL MAP</p>
        </div>
        <h2 className="font-pixel text-pixel-white text-xl md:text-2xl">
          Constellation<span className="text-pixel-cyan">.</span>
        </h2>
        <p className="font-mono text-pixel-gray/50 text-sm mt-2">
          Hover a star to trace its connections across the realm.
        </p>
      </div>

      {/* Category filter */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`font-mono text-xs px-3 py-1.5 border transition-all duration-200 ${
              activeCategory === cat.id
                ? 'border-pixel-cyan/70 text-pixel-cyan bg-pixel-cyan/10'
                : 'border-pixel-blue/20 text-pixel-gray/50 hover:border-pixel-blue/50 hover:text-pixel-white/70'
            }`}
            style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
          >
            {activeCategory === cat.id && <span className="mr-1.5">●</span>}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="max-w-6xl mx-auto relative" ref={containerRef}>
        <div
          className="relative border border-pixel-blue/10 bg-bg-secondary/25 backdrop-blur-sm overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
        >
          {['top-0 left-0 border-t-2 border-l-2','top-0 right-4 border-t-2 border-r-2','bottom-4 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
            <div key={i} className={`absolute w-4 h-4 border-pixel-cyan/35 z-10 ${cls}`} />
          ))}
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredSkill(null)}
            style={{ width: '100%', height: canvasSize.h, cursor: hoveredSkill ? 'crosshair' : 'default', display: 'block' }}
          />
          <AnimatePresence>
            {hovered && (() => {
              const tier      = TIER_CONFIG[hovered.tier];
              const catColor  = CATEGORY_COLORS[hovered.category] || tier.color;
              const Icon      = hovered.icon;
              const connected = hovered.connects.map(id => SKILLS.find(s => s.id === id)?.label).filter(Boolean);
              return (
                <motion.div key={hovered.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-4 left-4 z-20 pointer-events-none"
                >
                  <div className="bg-bg-primary/96 border px-4 py-3 backdrop-blur-sm min-w-[200px]"
                    style={{ borderColor: `${catColor}44`, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))', boxShadow: `0 0 24px ${catColor}1a` }}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div style={{ color: catColor }} className="text-lg"><Icon /></div>
                      <p className="font-pixel text-pixel-white text-[11px]">{hovered.label}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[9px] px-1.5 py-0.5"
                        style={{ background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
                        {tier.label}
                      </span>
                      <span className="font-mono text-pixel-gray/40 text-[9px] capitalize">{hovered.category}</span>
                    </div>
                    {connected.length > 0 && (
                      <p className="font-mono text-pixel-gray/40 text-[9px]">connects → {connected.join(', ')}</p>
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
          {!hoveredSkill && (
            <p className="absolute bottom-3 right-4 font-pixel text-pixel-gray/20 text-[8px] pointer-events-none">HOVER A STAR</p>
          )}
        </div>
      </div>

      {/* Tier legend */}
      <div className="max-w-6xl mx-auto mt-5 flex flex-wrap gap-x-5 gap-y-2 justify-end">
        {Object.entries(TIER_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="rounded-full flex-shrink-0"
              style={{ width: cfg.size * 1.6, height: cfg.size * 1.6, background: cfg.color, boxShadow: `0 0 5px ${cfg.glow}` }} />
            <span className="font-mono text-pixel-gray/40 text-[10px]">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* XP Bar - infinite */}
      <div className="max-w-6xl mx-auto">
        <XPBar />
      </div>

    </section>
  );
}
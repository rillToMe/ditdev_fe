import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiGithub, FiInstagram} from 'react-icons/fi';
import { SiTiktok, SiUnity, SiGodotengine, SiReact, SiBlender, SiUnrealengine, SiGithub } from 'react-icons/si';
import axios from 'axios';
import { DiVisualstudio } from 'react-icons/di'
import { BiLogoVisualStudio } from "react-icons/bi";
import { TbBrandCSharp } from "react-icons/tb";
import { LuInfinity } from "react-icons/lu";

<LuInfinity className="inline text-yellow-400" size={14} />

import avatarImg from '../assets/img/icons/avatar.jpeg';

const techStack = [
  { icon: <SiUnity />,        name: 'Unity',         color: '#ffffff' },
  { icon: <SiGodotengine />,  name: 'Godot',         color: '#478cbf' },
  { icon: <SiReact />,        name: 'React',         color: '#61dafb' },
  { icon: <TbBrandCSharp />,  name: 'C#',            color: '#9b4f96' },
  { icon: <SiUnrealengine />, name: 'Unreal',        color: '#aaaaaa' },
  { icon: <SiBlender />,      name: 'Blender',       color: '#f5792a' },
  { icon: <SiGithub />,       name: 'GitHub',        color: '#f0f6fc' },
  { icon: <BiLogoVisualStudio />,         name: 'VS Code',       color: '#007acc' },
  { icon: <DiVisualstudio />,         name: 'Visual Studio', color: '#5c2d91' },
];

const KEY_COLORS = {
  total_projects   : '#4f8cff',
  months_studying  : '#a29bfe',
  experiments_done : '#00d4ff',
  years_coding     : '#61dafb',
  cups_of_coffee   : '#fdcb6e',
  bugs_fixed       : '#ff7675',
  passion          : '#fd79a8',
};
const getColor = (key) => KEY_COLORS[key] || '#4f8cff';

const formatValue = (val) => {
  if (val === '∞' || val === Infinity) return '∞';
  const n = Number(val);
  if (!isNaN(n)) return `${n}+`;
  return String(val);
};

// Hardcoded stats always displayed - top-left & bottom-left positions
const HARDCODED_STATS = [
  { key: 'cups_of_coffee', value: '∞', label: 'Cups of Coffee' },
  { key: 'bugs_fixed',     value: '∞', label: 'Bugs Fixed'     },
];

export default function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  // Right 2 slots from API (limit to first 2)
  const [apiStats, setApiStats] = useState([
    { key: 'months_studying',  value: 20, label: 'Months Studying'  },
    { key: 'experiments_done', value: 11, label: 'Experiments Done' },
  ]);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || '/api';
    axios.get(`${API}/stats`)
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setApiStats(res.data.data.slice(0, 2));
        }
      })
      .catch(() => {/* fallback */});
  }, []);

  const gridStats = [
    HARDCODED_STATS[0],
    apiStats[0],
    HARDCODED_STATS[1],
    apiStats[1] || null,
  ].filter(Boolean);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <section id="about" className="relative py-28 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pixel-blue/20 to-transparent" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="mb-16"
        >
          <motion.p variants={itemVariants} className="section-tag mb-3">// 01. about</motion.p>
          <motion.h2 variants={itemVariants} className="font-sans font-bold text-4xl md:text-5xl text-pixel-white">
            Who Am <span className="gradient-text">I?</span>
          </motion.h2>
          <motion.div variants={itemVariants} className="section-divider max-w-xs mt-4" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Bio */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="space-y-6"
          >
            {/* Avatar card */}
            <motion.div variants={itemVariants} className="relative w-fit">
              <div
                className="w-32 h-32 border-2 border-pixel-blue/50 relative overflow-hidden bg-bg-primary"
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
              >
                {avatarImg ? (
                  <>
                    <img src={avatarImg} alt="Rahmat Aditya" className="w-full h-full object-cover" />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)' }}
                    />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 grid-overlay opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-pixel text-4xl text-pixel-blue opacity-60">RA</span>
                    </div>
                  </>
                )}
              </div>

              {/* Corner accents */}
              <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-pixel-cyan/80" />
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-pixel-cyan/80" />
              <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-pixel-blue/80" />
              <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-pixel-blue/80" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-pixel-cyan animate-pulse" />
              <div className="absolute bottom-1 left-1 w-2 h-2 bg-pixel-blue animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-3 -right-3 px-2 py-1 bg-bg-primary border border-yellow-400/50 font-pixel text-yellow-400 text-xs flex items-center gap-1">
                LVL <LuInfinity size={12} />+
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <p className="font-sans text-pixel-gray/90 leading-relaxed text-base">
                Hey! I'm <span className="text-pixel-white font-semibold">Adit</span>, a passionate
                <span className="text-pixel-blue"> Game Developer</span> and
                <span className="text-pixel-cyan"> Web Enthusiast</span> from the beautiful Sumatera Barat, Indonesia.
              </p>
              <p className="font-sans text-pixel-gray/80 leading-relaxed text-base">
                I craft interactive experiences - from immersive game worlds built with Unity and Godot,
                to modern web applications. Every project is a new quest, every bug is a final boss to defeat.
              </p>
              <p className="font-sans text-pixel-gray/80 leading-relaxed text-base">
                When I'm not pushing commits or debugging at 2 AM, I'm exploring music through TikTok,
                writing lyrics on Instagram, or discovering new mechanics in games for "research" purposes.
              </p>
            </motion.div>

            {/* Social row */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
              {[
                { href: 'https://github.com/rillToMe',               icon: <FiGithub />,    label: 'GitHub'    },
                { href: 'https://www.tiktok.com/@goodvibes_music28', icon: <SiTiktok />,    label: 'TikTok'    },
                { href: 'https://www.instagram.com/rill_lyrics/',    icon: <FiInstagram />, label: 'Instagram' },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border border-pixel-blue/20 text-pixel-gray hover:text-pixel-blue hover:border-pixel-blue/50 hover:bg-pixel-blue/5 transition-all font-mono text-xs"
                  style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                >
                  <span className="text-sm">{icon}</span>
                  {label}
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Stats + Tech */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="space-y-8"
          >
            {/* Stats grid 2x2: left=hardcode, right=API */}
            <motion.div variants={itemVariants}>
              <p className="font-pixel text-pixel-gray/50 text-[9px] tracking-widest mb-4">// PLAYER STATS</p>
              <div className="grid grid-cols-2 gap-3">
                {gridStats.map((stat, i) => {
                  const color = getColor(stat.key);
                  const isHardcoded = stat.key === 'cups_of_coffee' || stat.key === 'bugs_fixed';
                  return (
                    <motion.div
                      key={stat.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="p-4 border border-pixel-blue/15 bg-bg-card/50 pixel-corners relative overflow-hidden group hover:border-pixel-blue/40 transition-all"
                    >
                      <div className="absolute inset-0 grid-overlay opacity-30" />
                      {/* Top accent line on hover */}
                      <div
                        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }}
                      />
                      <p
                        className="font-pixel text-xl relative"
                        style={{ color, textShadow: `0 0 10px ${color}44` }}
                      >
                        {formatValue(stat.value)}
                      </p>
                      <p className="font-mono text-pixel-gray/60 text-xs mt-1 relative">
                        {stat.label}
                      </p>
                      {isHardcoded && (
                        <span className="absolute top-2 right-2 font-pixel text-[7px] px-1 py-px"
                          style={{ color: `${color}88`, border: `1px solid ${color}33` }}>
                          ∞
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Tech stack */}
            <motion.div variants={itemVariants}>
              <p className="font-pixel text-pixel-gray/50 text-[9px] tracking-widest mb-4">// TECH STACK</p>
              <div className="flex flex-wrap gap-2">
                {techStack.map(({ icon, name, color }) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-3 py-2 border border-pixel-blue/15 bg-bg-card/30 hover:border-pixel-blue/40 hover:bg-pixel-blue/5 transition-all group cursor-default"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                  >
                    <span style={{ color }} className="text-sm transition-transform group-hover:scale-110">{icon}</span>
                    <span className="font-mono text-pixel-gray/80 text-xs group-hover:text-pixel-white transition-colors">{name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Code snippet */}
            <motion.div variants={itemVariants}>
              <div className="p-4 border border-pixel-blue/10 bg-bg-card/30 font-mono text-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pixel-blue/10">
                  <span className="w-2 h-2 rounded-full bg-red-400/70" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
                  <span className="w-2 h-2 rounded-full bg-green-400/70" />
                  <span className="text-pixel-gray/30 ml-2 text-xs">adit.cs</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <p><span className="text-purple-400">class</span> <span className="text-cyan-400">Adit</span> <span className="text-pixel-gray">:</span> <span className="text-yellow-400">Developer</span> {'{'}</p>
                  <p className="pl-4"><span className="text-pixel-blue">string</span> <span className="text-pixel-white">name</span> = <span className="text-green-400">"Rahmat Aditya"</span>;</p>
                  <p className="pl-4"><span className="text-pixel-blue">string</span> <span className="text-pixel-white">location</span> = <span className="text-green-400">"Sumatera Barat"</span>;</p>
                  <p className="pl-4"><span className="text-pixel-blue">bool</span> <span className="text-pixel-white">openToWork</span> = <span className="text-cyan-400">true</span>;</p>
                  <p className="pl-4"><span className="text-pixel-blue">string[]</span> <span className="text-pixel-white">passion</span> = {'{'}<span className="text-green-400">"Games"</span>, <span className="text-green-400">"Web"</span>, <span className="text-green-400">"Music"</span>{'}'};</p>
                  <p>{'}'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
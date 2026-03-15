import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiInstagram } from 'react-icons/fi';
import { HiLocationMarker } from 'react-icons/hi';
import { SiTiktok } from 'react-icons/si';
import useTypewriter from '../hooks/useTypewriter';

const roles = [
  'Game Developer',
  'Web Enthusiast',
  'Unity Programmer',
  'Indie Creator',
  'C# Programmer',
];

export default function Hero() {
  const canvasRef = useRef(null);
  const typed = useTypewriter(roles, 80, 40, 1800);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.blinkSpeed = Math.random() * 0.01 + 0.003;
        this.blinkDir = Math.random() > 0.5 ? 1 : -1;
        this.color = Math.random() > 0.8 ? '#00d4ff' : '#4f8cff';
      }
      update() {
        this.opacity += this.blinkSpeed * this.blinkDir;
        if (this.opacity > 0.8 || this.opacity < 0.05) this.blinkDir *= -1;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Star());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-100 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,140,255,0.06) 0%, rgba(0,212,255,0.03) 40%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20 pb-8 md:pt-24 md:pb-20">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <div
            className="flex items-center gap-2 px-4 py-2 border border-green-400/30 bg-green-400/5"
            style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
          >
            <span className="w-2 h-2 bg-green-400 animate-pulse" />
            <span className="font-mono text-green-400 text-xs tracking-widest">AVAILABLE FOR WORK</span>
          </div>
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <p className="font-pixel text-pixel-cyan text-xs tracking-widest mb-4">// PLAYER ONE</p>
          <h1 className="font-sans font-extrabold leading-none mb-2">
            <span className="block text-5xl md:text-7xl lg:text-8xl text-pixel-white">Rahmat</span>
            <span className="block text-5xl md:text-7xl lg:text-8xl gradient-text">Aditya</span>
          </h1>
        </motion.div>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 mb-8 h-8 flex items-center justify-center"
        >
          <span className="font-mono text-pixel-gray text-lg">
            <span className="text-pixel-blue mr-2">&gt;</span>
            <span className="text-pixel-white">{typed}</span>
            <span className="inline-block w-0.5 h-5 bg-pixel-cyan ml-0.5 animate-blink" />
          </span>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          <HiLocationMarker className="text-pixel-blue text-sm" />
          <span className="font-mono text-pixel-gray text-sm">Sumatera Barat, Indonesia</span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <button onClick={() => scrollTo('projects')} className="btn-pixel btn-pixel-primary text-sm">
            <span className="mr-2">⚔</span> View Projects
          </button>
          <button onClick={() => scrollTo('contact')} className="btn-pixel text-sm">
            <span className="mr-2">✉</span> Contact Me
          </button>
          <a
            href="/cv.pdf"
            download="Rahmat_Aditya_CV.pdf"
            className="btn-pixel text-sm"
          >
            <span className="mr-2">↓</span> Download CV
          </a>
        </motion.div>

        {/* Socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          {[
            { href: 'https://github.com/rillToMe', icon: <FiGithub />, label: 'GitHub' },
            { href: 'https://www.tiktok.com/@goodvibes_music28', icon: <SiTiktok />, label: 'TikTok' },
            { href: 'https://www.instagram.com/rill_lyrics/', icon: <FiInstagram />, label: 'Instagram' },
          ].map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 flex items-center justify-center border border-pixel-blue/20 text-pixel-gray hover:text-pixel-blue hover:border-pixel-blue/60 hover:bg-pixel-blue/10 transition-all duration-200 text-lg"
              style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
            >
              {icon}
            </a>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-pixel text-pixel-gray/40 text-[8px] tracking-widest">SCROLL</span>
        <div className="flex flex-col gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-pixel-blue/40"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
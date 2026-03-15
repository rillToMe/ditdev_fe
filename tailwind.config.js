/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#0d1224',
          card: '#111827',
          hover: '#1a2035',
        },
        pixel: {
          blue: '#4f8cff',
          cyan: '#00d4ff',
          purple: '#7c5cbf',
          green: '#39d353',
          yellow: '#ffd700',
          red: '#ff4757',
          pink: '#ff6b9d',
          white: '#e8eaf6',
          gray: '#8892a4',
          dark: '#1e2a3a',
        }
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(79, 140, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79, 140, 255, 0.03) 1px, transparent 1px)`,
        'scan-lines': `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.1) 2px,
          rgba(0, 0, 0, 0.1) 4px
        )`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'pixel-in': 'pixelIn 0.6s steps(6) forwards',
        'scanline': 'scanline 8s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pixelIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(79,140,255,0.3), 0 0 10px rgba(79,140,255,0.2)' },
          '50%': { boxShadow: '0 0 15px rgba(79,140,255,0.6), 0 0 30px rgba(79,140,255,0.3)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0px #000, inset -4px -4px 0px rgba(0,0,0,0.3)',
        'pixel-blue': '0 0 15px rgba(79,140,255,0.4), 4px 4px 0px rgba(79,140,255,0.2)',
        'pixel-cyan': '0 0 15px rgba(0,212,255,0.4)',
        'glow-blue': '0 0 20px rgba(79,140,255,0.5)',
        'glow-cyan': '0 0 20px rgba(0,212,255,0.5)',
      },
      dropShadow: {
        'pixel': '2px 2px 0px rgba(0,0,0,0.8)',
        'glow': '0 0 8px rgba(79,140,255,0.8)',
      }
    },
  },
  plugins: [],
}

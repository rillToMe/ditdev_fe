export default function SectionLoader({ height = 'py-28', label = 'LOADING...' }) {
  return (
    <div className={`relative w-full flex items-center justify-center ${height} overflow-hidden`}>
      {/* Subtle grid bg */}
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Pixel spinner */}
        <div
          className="relative w-12 h-12 flex items-center justify-center"
          style={{
            background: 'rgba(79,140,255,0.05)',
            border    : '1px solid rgba(79,140,255,0.15)',
            clipPath  : 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
          }}
        >
          <div
            className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(79,140,255,0.15)', borderTopColor: '#4f8cff' }}
          />
          {/* Center dot pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-pixel-blue animate-pulse" />
          </div>
        </div>

        {/* Label */}
        <p
          className="font-pixel text-[9px] tracking-[0.25em] animate-pulse"
          style={{ color: 'rgba(79,140,255,0.4)' }}
        >
          {label}
        </p>

        {/* Pixel dots row */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-1 h-1"
              style={{
                background: 'rgba(79,140,255,0.25)',
                animation : `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
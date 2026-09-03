export default function SectionDivider() {
  return (
    <div className="relative h-px mx-auto max-w-6xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pixel-blue/20 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <span className="w-1 h-1 bg-pixel-blue/30" />
        <span className="w-1.5 h-1.5 bg-pixel-blue/50" />
        <span className="w-1 h-1 bg-pixel-blue/30" />
      </div>
    </div>
  )
}
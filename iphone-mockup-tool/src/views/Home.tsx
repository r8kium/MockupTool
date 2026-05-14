import { Cpu, Film, Layers, Sparkles } from 'lucide-react'

interface Props {
  onStart: () => void
}

const FEATURES = [
  { icon: Layers,   label: '53 devices' },
  { icon: Film,     label: 'MP4 export' },
  { icon: Sparkles, label: '10 environments' },
  { icon: Cpu,      label: '16 animations' },
]

export function Home({ onStart }: Props) {
  return (
    <div className="relative h-screen bg-[#080808] text-white flex flex-col items-center justify-center overflow-hidden select-none">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse, #8b5cf6 0%, transparent 70%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl px-8">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] text-white/50 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Free · Zero installs · Runs in your browser
        </div>

        {/* Wordmark */}
        <h1 className="text-6xl font-bold tracking-tight leading-none mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Mockup Tool
        </h1>

        {/* Tagline */}
        <p className="text-lg text-white/40 leading-relaxed mb-10">
          Studio-quality 3D device mockups.<br />
          Animate. Export. Ship.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-white/50">
              <Icon className="w-3.5 h-3.5 text-white/30" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-white text-[#080808] text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.08)]"
        >
          Start Creating
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Bottom wordmark */}
      <div className="absolute bottom-6 text-[11px] text-white/15 tracking-wider">
        MOCKUP TOOL
      </div>
    </div>
  )
}

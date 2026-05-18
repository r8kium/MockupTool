import { ArrowRight } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { cn } from '@/lib/utils'

interface Intent {
  id: string
  label: string
  sub: string
  presetId: string | null
  dims: string
  ratio: string  // CSS aspect-ratio for preview pill
  color: string  // accent color class
}

const INTENTS: Intent[] = [
  {
    id: 'app-store',
    label: 'App Store',
    sub: 'iPhone & iPad screenshots',
    presetId: 'appstore-67',
    dims: '1290 × 2796',
    ratio: '9/19.5',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 hover:border-blue-400/40',
  },
  {
    id: 'story',
    label: 'Story / Reel',
    sub: 'Instagram · TikTok · Shorts',
    presetId: 'story',
    dims: '1080 × 1920',
    ratio: '9/16',
    color: 'from-pink-500/20 to-purple-600/10 border-pink-500/20 hover:border-pink-400/40',
  },
  {
    id: 'social-post',
    label: 'Social Post',
    sub: 'Instagram · Facebook square',
    presetId: 'square',
    dims: '1080 × 1080',
    ratio: '1/1',
    color: 'from-orange-500/20 to-yellow-600/10 border-orange-500/20 hover:border-orange-400/40',
  },
  {
    id: 'product-ad',
    label: 'Product Ad',
    sub: 'Facebook · LinkedIn banner',
    presetId: 'facebook-ad',
    dims: '1200 × 628',
    ratio: '1.91/1',
    color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/20 hover:border-emerald-400/40',
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    sub: 'Post & ad format',
    presetId: 'twitter',
    dims: '1200 × 675',
    ratio: '16/9',
    color: 'from-sky-500/20 to-cyan-600/10 border-sky-500/20 hover:border-sky-400/40',
  },
  {
    id: 'free',
    label: 'Free Canvas',
    sub: 'No size constraint',
    presetId: null,
    dims: 'Any size',
    ratio: '4/3',
    color: 'from-white/8 to-white/4 border-white/10 hover:border-white/25',
  },
]

interface Props {
  onContinue: () => void
}

export function IntentScreen({ onContinue }: Props) {
  const { setCanvasPreset } = useEditorStore()

  const handlePick = (intent: Intent) => {
    setCanvasPreset(intent.presetId)
    onContinue()
  }

  return (
    <div className="h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-8 overflow-hidden">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[11px] text-white/40 font-medium tracking-wide uppercase">
          Mockup Tool
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          What are you creating?
        </h1>
        <p className="text-sm text-white/40">
          Pick a format to get started — sets the canvas to the right size
        </p>
      </div>

      {/* Intent grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl">
        {INTENTS.map((intent) => (
          <button
            key={intent.id}
            onClick={() => handlePick(intent)}
            className={cn(
              'group relative flex flex-col gap-3 p-4 rounded-2xl border bg-gradient-to-br transition-all text-left',
              intent.color
            )}
          >
            {/* Aspect ratio preview */}
            <div className="flex items-center gap-2">
              <div
                className="bg-white/10 rounded-sm flex-shrink-0"
                style={{
                  aspectRatio: intent.ratio,
                  width: intent.ratio === '1/1' ? 22
                       : intent.ratio.startsWith('9') ? 10
                       : 22,
                  height: intent.ratio === '1/1' ? 22
                        : intent.ratio.startsWith('9') ? 18
                        : 'auto',
                }}
              />
              <span className="text-[9px] font-mono text-white/30">{intent.dims}</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                {intent.label}
              </p>
              <p className="text-[11px] text-white/35 mt-0.5 leading-snug">{intent.sub}</p>
            </div>

            <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-white/20">
        You can change the format at any time from the editor
      </p>
    </div>
  )
}

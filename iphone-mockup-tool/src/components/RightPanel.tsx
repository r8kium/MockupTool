import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useEditorStore, type ShadowPreset } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'
import { ANIM_TEMPLATES } from '@/lib/animTemplates'
import type { BackgroundConfig, BackgroundType } from '@/types'
import { cn, readFileAsDataUrl } from '@/lib/utils'

const SHADOW_PRESETS: { id: ShadowPreset; label: string }[] = [
  { id: 'none',  label: 'None' },
  { id: 'soft',  label: 'Soft' },
  { id: 'long',  label: 'Long & Smooth' },
  { id: 'short', label: 'Short & Crisp' },
]

const PRESET_GRADIENTS = [
  { from: '#6366f1', to: '#8b5cf6' },
  { from: '#0ea5e9', to: '#2dd4bf' },
  { from: '#f59e0b', to: '#ef4444' },
  { from: '#10b981', to: '#0ea5e9' },
  { from: '#1e1b4b', to: '#312e81' },
  { from: '#f43f5e', to: '#fb923c' },
]

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-white/30" /> : <ChevronRight className="w-3.5 h-3.5 text-white/30" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

function BgImageDropzone() {
  const { setBackground, background } = useEditorStore()
  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]; if (!file) return
    setBackground({ type: 'image', imageDataUrl: await readFileAsDataUrl(file) })
  }, [setBackground])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [] }, maxFiles: 1
  })
  return (
    <div
      {...getRootProps()}
      className="flex items-center justify-center h-16 rounded-lg border border-dashed border-white/20 hover:border-white/40 cursor-pointer transition-colors text-xs text-white/40"
    >
      <input {...getInputProps()} />
      {isDragActive ? 'Drop image' : background.imageDataUrl ? 'Background set — drop to replace' : 'Drop or click to upload'}
    </div>
  )
}

export function RightPanel({ onOpenBrowser }: { onOpenBrowser: () => void }) {
  const state = useEditorStore()
  const device = DEVICE_MODELS[state.deviceId]

  const setType = (type: BackgroundType) => {
    const next: BackgroundConfig = { ...state.background, type }
    if (type === 'solid' && !next.solidColor) next.solidColor = '#ffffff'
    if (type === 'gradient') {
      if (!next.gradientFrom) next.gradientFrom = '#6366f1'
      if (!next.gradientTo) next.gradientTo = '#8b5cf6'
      if (next.gradientAngle === undefined) next.gradientAngle = 135
    }
    state.setBackground(next)
  }

  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#252525] border-l border-white/5 overflow-y-auto flex flex-col">

      {/* Animation */}
      <Section title="Animation" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {/* None card */}
          <button
            onClick={() => state.setAnimTemplate(null)}
            className={cn(
              'relative rounded-lg overflow-hidden border-2 transition-all aspect-video flex items-center justify-center text-xs font-medium',
              state.animTemplateId === null
                ? 'border-blue-500 text-blue-300 bg-blue-500/10'
                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/60 bg-white/3'
            )}
          >
            None
          </button>

          {ANIM_TEMPLATES.map((tpl) => {
            const active = state.animTemplateId === tpl.id
            return (
              <button
                key={tpl.id}
                onClick={() => state.setAnimTemplate(tpl.id)}
                className={cn(
                  'relative rounded-lg overflow-hidden border-2 transition-all aspect-video group',
                  active ? 'border-blue-500' : 'border-white/10 hover:border-white/30'
                )}
              >
                {/* Rotato templates: show original MP4 preview */}
                {tpl.previewPath && (
                  <video
                    src={tpl.previewPath}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                )}

                {/* New templates: device thumbnail with CSS animation */}
                {!tpl.previewPath && tpl.previewAnim && (
                  <div className="w-full h-full bg-[#181818] flex items-center justify-center overflow-hidden">
                    <img
                      src={device.thumbnailPath}
                      alt={tpl.name}
                      style={{ animation: tpl.previewAnim, willChange: 'transform' }}
                      className="w-[52%] h-[82%] object-contain drop-shadow-lg"
                    />
                  </div>
                )}

                {/* Label overlay — always visible on active, hover for others */}
                <div className={cn(
                  'absolute inset-0 flex items-end p-1.5 bg-gradient-to-t from-black/70 to-transparent transition-opacity pointer-events-none',
                  active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}>
                  <span className="text-[10px] font-medium text-white leading-tight">{tpl.name}</span>
                </div>

                {active && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Device */}
      <Section title="Device">
        <button
          onClick={onOpenBrowser}
          className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-white/5 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[#1e1e1e] flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={device.thumbnailPath} alt={device.name} className="w-full h-full object-contain p-1" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{device.name}</p>
            <p className="text-xs text-white/40 capitalize">{device.category}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 ml-auto flex-shrink-0" />
        </button>

        {/* Color swatches */}
        <div>
          <p className="text-xs text-white/40 mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {device.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => state.setColor(color.id)}
                title={color.label}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all',
                  state.colorId === color.id
                    ? 'border-blue-400 scale-110'
                    : 'border-white/20 hover:border-white/50'
                )}
                style={{ background: color.hex }}
              />
            ))}
          </div>
        </div>

        {/* Camera angle */}
        <div>
          <p className="text-xs text-white/40 mb-2">
            View{state.animTemplateId && <span className="ml-1.5 text-white/25">(overridden by animation)</span>}
          </p>
          <div className={cn('grid grid-cols-3 gap-1', state.animTemplateId && 'opacity-30 pointer-events-none')}>
            {(['front', 'isometric', 'side'] as const).map((angle) => (
              <button
                key={angle}
                onClick={() => state.setCameraAngle(angle)}
                className={cn(
                  'py-1.5 rounded-md text-xs font-medium border transition-colors capitalize',
                  state.cameraAngle === angle
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                )}
              >
                {angle}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Background */}
      <Section title="Background">
        {/* Type tabs */}
        <div className="grid grid-cols-4 gap-1 bg-white/5 rounded-lg p-0.5">
          {(['transparent', 'solid', 'gradient', 'image'] as BackgroundType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'py-1 rounded-md text-xs font-medium transition-colors capitalize',
                state.background.type === t
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {t === 'transparent' ? 'None' : t === 'gradient' ? 'Grad' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {state.background.type === 'solid' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={state.background.solidColor ?? '#ffffff'}
              onChange={(e) => state.setBackground({ ...state.background, solidColor: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent"
            />
            <input
              value={state.background.solidColor ?? '#ffffff'}
              onChange={(e) => state.setBackground({ ...state.background, solidColor: e.target.value })}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white/30"
              maxLength={7}
            />
          </div>
        )}

        {state.background.type === 'gradient' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => state.setBackground({ ...state.background, gradientFrom: g.from, gradientTo: g.to })}
                  className="w-7 h-7 rounded-full border border-white/20 hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg,${g.from},${g.to})` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs text-white/40">From</p>
                <div className="flex gap-1">
                  <input type="color" value={state.background.gradientFrom ?? '#6366f1'}
                    onChange={(e) => state.setBackground({ ...state.background, gradientFrom: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                  <input value={state.background.gradientFrom ?? '#6366f1'}
                    onChange={(e) => state.setBackground({ ...state.background, gradientFrom: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 text-xs font-mono text-white focus:outline-none min-w-0" maxLength={7} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/40">To</p>
                <div className="flex gap-1">
                  <input type="color" value={state.background.gradientTo ?? '#8b5cf6'}
                    onChange={(e) => state.setBackground({ ...state.background, gradientTo: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                  <input value={state.background.gradientTo ?? '#8b5cf6'}
                    onChange={(e) => state.setBackground({ ...state.background, gradientTo: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 text-xs font-mono text-white focus:outline-none min-w-0" maxLength={7} />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40">Angle: {state.background.gradientAngle ?? 135}°</p>
              <input type="range" min={0} max={360} step={5}
                value={state.background.gradientAngle ?? 135}
                onChange={(e) => state.setBackground({ ...state.background, gradientAngle: +e.target.value })}
                className="w-full accent-blue-500" />
            </div>
          </div>
        )}

        {state.background.type === 'image' && <BgImageDropzone />}
      </Section>

      {/* Shadows */}
      <Section title="Shadows">
        <div className="grid grid-cols-2 gap-1">
          {SHADOW_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => state.setShadowPreset(p.id)}
              className={cn(
                'py-2 px-3 rounded-lg text-xs font-medium border transition-colors text-left',
                state.shadowPreset === p.id
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  )
}

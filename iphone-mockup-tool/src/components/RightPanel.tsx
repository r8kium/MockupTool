import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useEditorStore, type ShadowPreset } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'
import { AnimSection } from '@/components/AnimSection'
import type { BackgroundConfig, BackgroundType } from '@/types'
import { cn, readFileAsDataUrl } from '@/lib/utils'
import { PRESET_BACKGROUNDS } from '@/lib/backgrounds'
import { ANIM_BACKGROUNDS } from '@/lib/animBackgrounds'
import { ENVIRONMENT_PRESETS } from '@/lib/environments'

const APPLE_COLORS = [
  { hex: '#8D8D8D', label: 'Titanium' },
  { hex: '#1D1D1F', label: 'Midnight' },
  { hex: '#EDE0CE', label: 'Starlight' },
  { hex: '#C0C0C0', label: 'Silver' },
  { hex: '#C8A97E', label: 'Gold' },
  { hex: '#B76E79', label: 'Rose Gold' },
  { hex: '#4B3F72', label: 'Deep Purple' },
  { hex: '#006E91', label: 'Pacific Blue' },
  { hex: '#556B55', label: 'Alpine Green' },
  { hex: '#CC0000', label: 'Product Red' },
  { hex: '#F5D13F', label: 'Yellow' },
  { hex: '#3C3C3C', label: 'Space Gray' },
]

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
  const [customHexInput, setCustomHexInput] = useState(state.customColorHex ?? '#ffffff')

  const handleCustomHexCommit = (value: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) state.setCustomColor(value)
  }

  const [presetTab, setPresetTab] = useState<'css' | 'photos' | 'animated'>('css')

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
        <AnimSection screenshot={state.screenshot} />
      </Section>

      {/* Environment */}
      <Section title="Environment" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1.5">
          {/* None */}
          <button
            onClick={() => state.setEnvironment(null)}
            className={cn(
              'relative rounded-lg border-2 transition-all h-10 flex items-center justify-center text-xs font-medium overflow-hidden',
              state.environmentId === null
                ? 'border-blue-500 text-blue-300 bg-blue-500/10'
                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/60'
            )}
          >
            None
          </button>

          {ENVIRONMENT_PRESETS.map((env) => {
            const active = state.environmentId === env.id
            return (
              <button
                key={env.id}
                onClick={() => state.setEnvironment(env.id)}
                title={env.name}
                className={cn(
                  'relative rounded-lg border-2 transition-all h-10 overflow-hidden group',
                  active ? 'border-blue-500' : 'border-white/10 hover:border-white/30'
                )}
              >
                {/* Color swatch background */}
                <div className="absolute inset-0" style={{ background: env.swatch }} />
                {/* Label overlay */}
                <div className={cn(
                  'absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity',
                  active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}>
                  <span className="text-[10px] font-semibold text-white drop-shadow">{env.name}</span>
                </div>
                {active && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400" />
                )}
              </button>
            )
          })}
        </div>
        {state.environmentId && (
          <p className="text-[10px] text-white/30 mt-1">
            IBL reflections active — flat lights replaced by environment
          </p>
        )}
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
        <div className="space-y-2.5">
          <p className="text-xs text-white/40">Color</p>

          {/* Device-specific colors */}
          <div className="flex flex-wrap gap-2">
            {device.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => state.setColor(color.id)}
                title={color.label}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all',
                  state.colorId === color.id && !state.customColorHex
                    ? 'border-blue-400 scale-110'
                    : 'border-white/20 hover:border-white/50'
                )}
                style={{ background: color.hex }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/8" />

          {/* Apple-standard presets */}
          <p className="text-xs text-white/25">More colors</p>
          <div className="flex flex-wrap gap-2">
            {APPLE_COLORS.map((color) => {
              const active = state.colorId === 'custom' && state.customColorHex === color.hex
              return (
                <button
                  key={color.hex}
                  onClick={() => { state.setCustomColor(color.hex); setCustomHexInput(color.hex) }}
                  title={color.label}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all',
                    active ? 'border-blue-400 scale-110' : 'border-white/20 hover:border-white/50'
                  )}
                  style={{ background: color.hex }}
                />
              )
            })}
          </div>

          {/* Custom hex input */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={state.colorId === 'custom' && state.customColorHex ? state.customColorHex : customHexInput}
              onChange={(e) => {
                setCustomHexInput(e.target.value)
                state.setCustomColor(e.target.value)
              }}
              className="w-8 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
            />
            <input
              value={state.colorId === 'custom' && state.customColorHex ? state.customColorHex : customHexInput}
              onChange={(e) => setCustomHexInput(e.target.value)}
              onBlur={(e) => handleCustomHexCommit(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustomHexCommit(customHexInput) }}
              placeholder="#ffffff"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white/30"
              maxLength={7}
            />
            {state.colorId === 'custom' && state.customColorHex && (
              <span className="text-[10px] text-blue-400 font-medium whitespace-nowrap">Custom</span>
            )}
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
        {/* Type tabs — 5 columns (Preset covers both preset + animated) */}
        <div className="grid grid-cols-5 gap-1 bg-white/5 rounded-lg p-0.5">
          {(['transparent', 'solid', 'gradient', 'image', 'preset'] as const).map((t) => {
            const isActive = t === 'preset'
              ? (state.background.type === 'preset' || state.background.type === 'animated')
              : state.background.type === t
            return (
              <button
                key={t}
                onClick={() => {
                  if (t === 'preset' && (state.background.type === 'preset' || state.background.type === 'animated')) return
                  setType(t)
                  if (t === 'preset') setPresetTab('css')
                }}
                className={cn(
                  'py-1 rounded-md text-[11px] font-medium transition-colors',
                  isActive ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
                )}
              >
                {t === 'transparent' ? 'None'
                  : t === 'gradient' ? 'Grad'
                  : t === 'preset' ? 'Preset'
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            )
          })}
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

        {(state.background.type === 'preset' || state.background.type === 'animated') && (
          <div className="space-y-3">
            {/* Sub-tabs: CSS / Photos / Animated */}
            <div className="grid grid-cols-3 gap-1 bg-white/5 rounded-lg p-0.5">
              {(['css', 'photos', 'animated'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setPresetTab(tab)
                    if (tab !== 'animated' && state.background.type === 'animated') {
                      state.setBackground({ ...state.background, type: 'preset' })
                    }
                    if (tab === 'animated' && state.background.type !== 'animated') {
                      state.setBackground({ ...state.background, type: 'animated' })
                    }
                  }}
                  className={cn(
                    'py-1 rounded-md text-[11px] font-medium transition-colors capitalize',
                    (tab === 'animated' ? state.background.type === 'animated' : presetTab === tab && state.background.type === 'preset')
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/70',
                  )}
                >
                  {tab === 'css' ? 'CSS' : tab === 'photos' ? 'Photos' : 'Animated'}
                </button>
              ))}
            </div>

            {/* CSS presets */}
            {presetTab === 'css' && state.background.type === 'preset' && (
              <div className="space-y-3">
                {(
                  [
                    { key: 'mesh-dark',  label: 'Mesh Dark' },
                    { key: 'mesh-light', label: 'Mesh Light' },
                    { key: 'gradient',   label: 'Gradient' },
                    { key: 'solid',      label: 'Studio' },
                  ] as const
                ).map(({ key, label }) => {
                  const items = PRESET_BACKGROUNDS.filter((b) => b.category === key)
                  return (
                    <div key={key}>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">{label}</p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {items.map((bg) => {
                          const active = state.background.presetId === bg.id
                          return (
                            <button
                              key={bg.id}
                              title={bg.name}
                              onClick={() => state.setBackground({ ...state.background, type: 'preset', presetId: bg.id })}
                              className={cn(
                                'aspect-square rounded-md border-2 transition-all hover:scale-110',
                                active
                                  ? 'border-blue-400 scale-110 shadow-[0_0_0_1px_rgba(96,165,250,0.5)]'
                                  : 'border-transparent hover:border-white/40',
                              )}
                              style={{ background: bg.css }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Photo presets */}
            {presetTab === 'photos' && state.background.type === 'preset' && (
              <div className="space-y-3">
                {(
                  [
                    { key: 'photo-dark',  label: 'Dark' },
                    { key: 'photo-vivid', label: 'Vivid' },
                    { key: 'photo-light', label: 'Light' },
                  ] as const
                ).map(({ key, label }) => {
                  const items = PRESET_BACKGROUNDS.filter((b) => b.category === key)
                  return (
                    <div key={key}>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">{label}</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {items.map((bg) => {
                          const active = state.background.presetId === bg.id
                          return (
                            <button
                              key={bg.id}
                              title={bg.name}
                              onClick={() => state.setBackground({ ...state.background, type: 'preset', presetId: bg.id })}
                              className={cn(
                                'aspect-video rounded-md border-2 transition-all hover:scale-105 overflow-hidden',
                                active
                                  ? 'border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.5)]'
                                  : 'border-transparent hover:border-white/40',
                              )}
                              style={{ background: bg.css }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Animated presets */}
            {state.background.type === 'animated' && (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Dark</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ANIM_BACKGROUNDS.filter((b) => !b.base.startsWith('#f') && !b.base.startsWith('#fff')).map((bg) => {
                      const active = state.background.animBgId === bg.id
                      return (
                        <button
                          key={bg.id}
                          title={bg.name}
                          onClick={() => state.setBackground({ ...state.background, type: 'animated', animBgId: bg.id })}
                          className={cn(
                            'aspect-video rounded-md border-2 transition-all hover:scale-105 overflow-hidden relative',
                            active
                              ? 'border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.5)]'
                              : 'border-transparent hover:border-white/40',
                          )}
                          style={{ background: bg.previewCss }}
                        >
                          <span className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] text-white/60 font-medium leading-none pb-0.5">{bg.name}</span>
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Light</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ANIM_BACKGROUNDS.filter((b) => b.base.startsWith('#f') || b.base.startsWith('#fff')).map((bg) => {
                      const active = state.background.animBgId === bg.id
                      return (
                        <button
                          key={bg.id}
                          title={bg.name}
                          onClick={() => state.setBackground({ ...state.background, type: 'animated', animBgId: bg.id })}
                          className={cn(
                            'aspect-video rounded-md border-2 transition-all hover:scale-105 overflow-hidden relative',
                            active
                              ? 'border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.5)]'
                              : 'border-transparent hover:border-white/40',
                          )}
                          style={{ background: bg.previewCss }}
                        >
                          <span className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] text-black/40 font-medium leading-none pb-0.5">{bg.name}</span>
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-black/30 animate-pulse" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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

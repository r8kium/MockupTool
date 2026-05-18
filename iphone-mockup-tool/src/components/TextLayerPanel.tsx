import { Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { ANIM_PRESET_LABELS } from '@/lib/textAnimations'
import type { TextLayer, TextAnimPreset } from '@/types'
import { cn } from '@/lib/utils'

const FONTS = [
  'Inter', 'Plus Jakarta Sans', 'DM Sans', 'Space Grotesk',
  'Bebas Neue', 'Playfair Display',
]

const WEIGHTS: { label: string; value: TextLayer['fontWeight'] }[] = [
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '600', value: 600 },
  { label: '700', value: 700 },
  { label: '800', value: 800 },
  { label: '900', value: 900 },
]

const ANIM_PRESETS = Object.keys(ANIM_PRESET_LABELS) as TextAnimPreset[]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-white/35 uppercase tracking-widest flex-shrink-0 w-20">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Slider({ value, min, max, step = 1, onChange }: {
  value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-indigo-500 h-1"
    />
  )
}

function NumberInput({ value, min, max, step = 1, onChange }: {
  value: number; min?: number; max?: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-white/5 border border-white/8 rounded-md px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-white/20"
    />
  )
}

function Select<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)}
      className="w-full bg-white/5 border border-white/8 rounded-md px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-white/20"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function TextLayerPanel() {
  const { textLayers, selectedLayerId, updateTextLayer, deleteTextLayer } = useEditorStore()
  const layer = textLayers.find(l => l.id === selectedLayerId)
  if (!layer) return null

  const upd = (updates: Partial<TextLayer>) => updateTextLayer(layer.id, updates)

  return (
    <div className="space-y-4">
      {/* Text content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/35 uppercase tracking-widest">Text</span>
          <button onClick={() => deleteTextLayer(layer.id)}
            className="text-white/25 hover:text-red-400 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        <textarea
          value={layer.text}
          onChange={(e) => upd({ text: e.target.value })}
          rows={3}
          className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/20 resize-none"
        />
      </div>

      {/* Font */}
      <div className="space-y-2">
        <span className="text-[10px] text-white/35 uppercase tracking-widest block">Font</span>
        <Select
          value={layer.fontFamily as typeof FONTS[number]}
          options={FONTS.map(f => ({ value: f, label: f }))}
          onChange={(v) => upd({ fontFamily: v })}
        />
        {/* Weight pills */}
        <div className="flex gap-1 flex-wrap">
          {WEIGHTS.map(w => (
            <button key={w.value} onClick={() => upd({ fontWeight: w.value })}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium transition-colors border',
                layer.fontWeight === w.value
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-white/5 border-white/8 text-white/35 hover:text-white/60'
              )}>
              {w.label}
            </button>
          ))}
        </div>
        {/* Style */}
        <div className="flex gap-1">
          {(['normal', 'italic'] as const).map(s => (
            <button key={s} onClick={() => upd({ fontStyle: s })}
              className={cn(
                'px-3 py-1 rounded text-xs border transition-colors capitalize flex-1',
                layer.fontStyle === s
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/8 text-white/40 hover:text-white/70'
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Size & Color */}
      <div className="space-y-2">
        <span className="text-[10px] text-white/35 uppercase tracking-widest block">Style</span>
        <Row label="Size">
          <div className="flex items-center gap-2">
            <Slider value={layer.fontSize} min={12} max={320} onChange={(v) => upd({ fontSize: v })} />
            <span className="text-xs text-white/50 w-8 text-right">{layer.fontSize}</span>
          </div>
        </Row>
        <Row label="Color">
          <div className="flex items-center gap-2">
            <input type="color" value={layer.color}
              onChange={(e) => upd({ color: e.target.value })}
              className="w-8 h-7 rounded cursor-pointer bg-transparent border-0 p-0" />
            <input type="text" value={layer.color}
              onChange={(e) => upd({ color: e.target.value })}
              className="flex-1 bg-white/5 border border-white/8 rounded px-2 py-1 text-xs text-white/70 font-mono focus:outline-none focus:border-white/20" />
          </div>
        </Row>
        <Row label="Opacity">
          <div className="flex items-center gap-2">
            <Slider value={Math.round(layer.opacity * 100)} min={0} max={100} onChange={(v) => upd({ opacity: v / 100 })} />
            <span className="text-xs text-white/50 w-8 text-right">{Math.round(layer.opacity * 100)}%</span>
          </div>
        </Row>
        <Row label="Align">
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} onClick={() => upd({ align: a })}
                className={cn(
                  'flex-1 py-1 rounded text-xs border transition-colors capitalize',
                  layer.align === a
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 border-white/8 text-white/40 hover:text-white/70'
                )}>
                {a}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Spacing">
          <div className="flex items-center gap-2">
            <Slider value={layer.letterSpacing * 100} min={-5} max={30} step={0.5} onChange={(v) => upd({ letterSpacing: v / 100 })} />
            <span className="text-xs text-white/50 w-8 text-right">{(layer.letterSpacing * 100).toFixed(0)}</span>
          </div>
        </Row>
        <Row label="Line H.">
          <div className="flex items-center gap-2">
            <Slider value={layer.lineHeight * 10} min={8} max={30} step={1} onChange={(v) => upd({ lineHeight: v / 10 })} />
            <span className="text-xs text-white/50 w-8 text-right">{layer.lineHeight.toFixed(1)}</span>
          </div>
        </Row>
      </div>

      {/* Animation */}
      <div className="space-y-2">
        <span className="text-[10px] text-white/35 uppercase tracking-widest block">Animation</span>
        <Row label="Enter">
          <Select
            value={layer.enterAnim}
            options={ANIM_PRESETS.map(p => ({ value: p, label: ANIM_PRESET_LABELS[p] }))}
            onChange={(v) => upd({ enterAnim: v })}
          />
        </Row>
        {layer.enterAnim !== 'none' && (
          <Row label="Duration">
            <div className="flex items-center gap-2">
              <Slider value={layer.enterDuration * 10} min={1} max={30} onChange={(v) => upd({ enterDuration: v / 10 })} />
              <span className="text-xs text-white/50 w-8 text-right">{layer.enterDuration.toFixed(1)}s</span>
            </div>
          </Row>
        )}
        <Row label="Exit">
          <Select
            value={layer.exitAnim}
            options={ANIM_PRESETS.map(p => ({ value: p, label: ANIM_PRESET_LABELS[p] }))}
            onChange={(v) => upd({ exitAnim: v })}
          />
        </Row>
        {layer.exitAnim !== 'none' && (
          <Row label="Duration">
            <div className="flex items-center gap-2">
              <Slider value={layer.exitDuration * 10} min={1} max={30} onChange={(v) => upd({ exitDuration: v / 10 })} />
              <span className="text-xs text-white/50 w-8 text-right">{layer.exitDuration.toFixed(1)}s</span>
            </div>
          </Row>
        )}
      </div>

      {/* Timing */}
      <div className="space-y-2">
        <span className="text-[10px] text-white/35 uppercase tracking-widest block">Timing</span>
        <Row label="Start">
          <div className="flex items-center gap-2">
            <Slider value={layer.startTime * 10} min={0} max={100} onChange={(v) => upd({ startTime: v / 10 })} />
            <span className="text-xs text-white/50 w-8 text-right">{layer.startTime.toFixed(1)}s</span>
          </div>
        </Row>
        <Row label="Hold">
          <div className="flex gap-2 items-center">
            <button onClick={() => upd({ duration: -1 })}
              className={cn(
                'px-2 py-1 rounded text-[10px] border transition-colors',
                layer.duration < 0
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-white/5 border-white/8 text-white/35 hover:text-white/60'
              )}>
              Always
            </button>
            {layer.duration >= 0 && (
              <div className="flex items-center gap-2 flex-1">
                <Slider value={layer.duration * 10} min={1} max={100} onChange={(v) => upd({ duration: v / 10 })} />
                <span className="text-xs text-white/50 w-8 text-right">{layer.duration.toFixed(1)}s</span>
              </div>
            )}
            {layer.duration < 0 && (
              <button onClick={() => upd({ duration: 2 })}
                className="px-2 py-1 rounded text-[10px] border bg-white/5 border-white/8 text-white/35 hover:text-white/60 transition-colors">
                Set duration
              </button>
            )}
          </div>
        </Row>
      </div>
    </div>
  )
}

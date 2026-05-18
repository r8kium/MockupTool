import { useState } from 'react'
import { Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import type { TextLayer, TextAnimPreset } from '@/types'
import { TEXT_EFFECTS } from '@/lib/textEffects'
import { ANIM_PRESET_LABELS } from '@/lib/textAnimations'
import { cn } from '@/lib/utils'

// ── Colour palette ────────────────────────────────────────────────────────────
const SWATCHES = [
  '#ffffff', '#f5f5f5', '#a3a3a3', '#525252', '#262626', '#000000',
  '#fef08a', '#fb923c', '#f87171', '#f472b6',
  '#c084fc', '#818cf8', '#60a5fa', '#34d399',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const FONTS = ['Inter', 'Plus Jakarta Sans', 'DM Sans', 'Space Grotesk', 'Bebas Neue', 'Playfair Display']
const WEIGHTS: { label: string; value: TextLayer['fontWeight'] }[] = [
  { label: '300', value: 300 }, { label: '400', value: 400 },
  { label: '500', value: 500 }, { label: '600', value: 600 },
  { label: '700', value: 700 }, { label: '800', value: 800 },
  { label: '900', value: 900 },
]
const ANIM_PRESETS = Object.keys(ANIM_PRESET_LABELS) as TextAnimPreset[]

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-medium text-white/35 uppercase tracking-widest">{children}</span>
}

function Slider({ value, min, max, step = 1, onChange }: {
  value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 accent-indigo-500"
    />
  )
}

function SegSelect<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string | React.ReactNode }[]; onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5">
      {options.map(o => (
        <button key={String(o.value)} onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 py-1 rounded-md text-xs transition-colors flex items-center justify-center',
            value === o.value ? 'bg-white/15 text-white' : 'text-white/35 hover:text-white/60'
          )}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Colour picker ─────────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hex, setHex] = useState(value)

  const commitHex = (raw: string) => {
    const v = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9a-fA-F]{6}$/.test(v)) { onChange(v); setHex(v) }
  }

  return (
    <div className="space-y-2">
      {/* Swatches */}
      <div className="grid grid-cols-7 gap-1.5">
        {SWATCHES.map(c => (
          <button key={c} onClick={() => { onChange(c); setHex(c) }}
            title={c}
            className="aspect-square rounded-md border-2 transition-transform hover:scale-110"
            style={{ background: c, borderColor: value === c ? '#6366f1' : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      {/* Custom + hex */}
      <div className="flex items-center gap-2">
        {/* Clickable swatch — native picker opens on click */}
        <label className="cursor-pointer flex-shrink-0">
          <div className="w-8 h-8 rounded-lg border border-white/20 ring-1 ring-white/5"
            style={{ background: value }} />
          <input type="color" value={value}
            onChange={(e) => { onChange(e.target.value); setHex(e.target.value) }}
            className="sr-only" />
        </label>
        <input
          type="text"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          onBlur={(e) => commitHex(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commitHex(hex)}
          placeholder="#ffffff"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white/80 focus:outline-none focus:border-white/30 placeholder:text-white/20"
        />
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function TextLayerPanel() {
  const { textLayers, selectedLayerId, updateTextLayer, deleteTextLayer } = useEditorStore()
  const layer = textLayers.find(l => l.id === selectedLayerId)
  if (!layer) return null

  const upd = (u: Partial<TextLayer>) => updateTextLayer(layer.id, u)

  return (
    <div className="space-y-5">

      {/* ── Text content ────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Content</Label>
          <button onClick={() => deleteTextLayer(layer.id)}
            className="text-white/20 hover:text-red-400 transition-colors p-0.5">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <textarea value={layer.text}
          onChange={(e) => upd({ text: e.target.value })}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-white/25 resize-none leading-snug"
        />
      </div>

      {/* ── Animation effects ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Animation Effect</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {TEXT_EFFECTS.map(fx => {
            const active = layer.enterAnim === fx.enter.anim &&
              Math.abs(layer.enterDuration - fx.enter.duration) < 0.01
            return (
              <button key={fx.id}
                onClick={() => upd({
                  enterAnim:     fx.enter.anim,
                  enterDuration: fx.enter.duration,
                  enterEasing:   fx.enter.easing,
                  exitAnim:      fx.exit.anim,
                  exitDuration:  fx.exit.duration,
                  exitEasing:    fx.exit.easing,
                })}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all',
                  active
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
                    : 'bg-white/3 border-white/8 text-white/50 hover:bg-white/6 hover:border-white/15 hover:text-white/80'
                )}
              >
                <span className="text-base leading-none flex-shrink-0">{fx.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold leading-tight">{fx.name}</p>
                  <p className="text-[9px] text-white/30 leading-tight mt-0.5 truncate">{fx.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Font ────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Font</Label>
        <select value={layer.fontFamily}
          onChange={(e) => upd({ fontFamily: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/25">
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {/* Weight */}
        <div className="flex gap-1 flex-wrap">
          {WEIGHTS.map(w => (
            <button key={w.value} onClick={() => upd({ fontWeight: w.value })}
              className={cn(
                'px-2 py-1 rounded-lg text-[10px] font-medium transition-colors border',
                layer.fontWeight === w.value
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/8 text-white/35 hover:text-white/60'
              )}>
              {w.label}
            </button>
          ))}
        </div>
        {/* Italic + align */}
        <div className="flex gap-1.5">
          <button onClick={() => upd({ fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs italic font-medium border transition-colors',
              layer.fontStyle === 'italic'
                ? 'bg-white text-black border-white'
                : 'bg-white/5 border-white/8 text-white/40 hover:text-white/70'
            )}>
            Italic
          </button>
          <div className="flex gap-0.5 flex-1 bg-white/5 rounded-lg p-0.5">
            {([
              { v: 'left'   as const, icon: <AlignLeft  className="w-3.5 h-3.5" /> },
              { v: 'center' as const, icon: <AlignCenter className="w-3.5 h-3.5" /> },
              { v: 'right'  as const, icon: <AlignRight  className="w-3.5 h-3.5" /> },
            ]).map(({ v, icon }) => (
              <button key={v} onClick={() => upd({ align: v })}
                className={cn(
                  'flex-1 py-1 rounded-md flex items-center justify-center transition-colors',
                  layer.align === v ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/60'
                )}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Colour ──────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Colour</Label>
        <ColorPicker value={layer.color} onChange={(v) => upd({ color: v })} />
      </div>

      {/* ── Size & spacing ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Size & Spacing</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Size</span>
            <Slider value={layer.fontSize} min={12} max={320} onChange={(v) => upd({ fontSize: v })} />
            <span className="text-xs text-white/50 w-8 text-right flex-shrink-0">{layer.fontSize}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Opacity</span>
            <Slider value={Math.round(layer.opacity * 100)} min={0} max={100} onChange={(v) => upd({ opacity: v / 100 })} />
            <span className="text-xs text-white/50 w-8 text-right flex-shrink-0">{Math.round(layer.opacity * 100)}%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Tracking</span>
            <Slider value={layer.letterSpacing * 100} min={-5} max={30} step={0.5} onChange={(v) => upd({ letterSpacing: v / 100 })} />
            <span className="text-xs text-white/50 w-8 text-right flex-shrink-0">{(layer.letterSpacing * 100).toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Line H.</span>
            <Slider value={layer.lineHeight * 10} min={8} max={30} step={1} onChange={(v) => upd({ lineHeight: v / 10 })} />
            <span className="text-xs text-white/50 w-8 text-right flex-shrink-0">{layer.lineHeight.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* ── Fine-tune animation ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Fine-tune</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-white/25 block mb-1">Enter</span>
            <select value={layer.enterAnim}
              onChange={(e) => upd({ enterAnim: e.target.value as TextAnimPreset })}
              className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-white/20">
              {ANIM_PRESETS.map(p => <option key={p} value={p}>{ANIM_PRESET_LABELS[p]}</option>)}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-white/25 block mb-1">Exit</span>
            <select value={layer.exitAnim}
              onChange={(e) => upd({ exitAnim: e.target.value as TextAnimPreset })}
              className="w-full bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-white/20">
              {ANIM_PRESETS.map(p => <option key={p} value={p}>{ANIM_PRESET_LABELS[p]}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-white/40 w-14 flex-shrink-0">Start</span>
          <Slider value={layer.startTime * 10} min={0} max={100} onChange={(v) => upd({ startTime: v / 10 })} />
          <span className="text-xs text-white/50 w-8 text-right flex-shrink-0">{layer.startTime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  )
}

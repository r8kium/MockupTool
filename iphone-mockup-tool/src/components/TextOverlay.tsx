import {
  useRef, useEffect, useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Bold, Italic, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { animClock } from '@/lib/animClock'
import { getTextLayerState } from '@/lib/textAnimations'
import { ANIM_TEMPLATE_MAP } from '@/lib/animTemplates'
import type { TextLayer } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  frameWidth: number
  frameHeight: number
}

// Module-level RAF state — no closures per render
const raf = { id: 0, lastTime: 0, localElapsed: 0 }

// ── Floating mini toolbar ─────────────────────────────────────────────────────
function FloatingToolbar({ layer, frameWidth, frameHeight }: {
  layer: TextLayer; frameWidth: number; frameHeight: number
}) {
  const { updateTextLayer, deleteTextLayer } = useEditorStore()
  const upd = (u: Partial<TextLayer>) => updateTextLayer(layer.id, u)

  const xPct = layer.x        // % of frame
  const yPct = layer.y        // % of frame
  const toolbarH = 40         // px — toolbar height approx
  const offset   = 52         // px — gap above text

  // Position in %, but clamp so toolbar never leaves the frame
  const topPct  = Math.max((toolbarH / frameHeight) * 100, yPct - (offset / frameHeight) * 100)
  const leftPct = Math.max(5, Math.min(95, xPct))

  return (
    <div
      className="absolute z-30 flex items-center gap-0.5 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl px-1.5 py-1 pointer-events-auto"
      style={{
        left: `${leftPct}%`,
        top:  `${topPct}%`,
        transform: 'translateX(-50%)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Size */}
      <div className="flex items-center gap-0.5">
        <button onClick={() => upd({ fontSize: Math.max(8, layer.fontSize - 4) })}
          className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white rounded-lg hover:bg-white/8 text-sm transition-colors">−</button>
        <span className="text-xs text-white/60 w-7 text-center tabular-nums">{layer.fontSize}</span>
        <button onClick={() => upd({ fontSize: Math.min(320, layer.fontSize + 4) })}
          className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white rounded-lg hover:bg-white/8 text-sm transition-colors">+</button>
      </div>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Bold */}
      <button onClick={() => upd({ fontWeight: layer.fontWeight >= 700 ? 400 : 700 })}
        className={cn('w-6 h-6 flex items-center justify-center rounded-lg transition-colors',
          layer.fontWeight >= 700 ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/8')}>
        <Bold className="w-3 h-3" />
      </button>

      {/* Italic */}
      <button onClick={() => upd({ fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
        className={cn('w-6 h-6 flex items-center justify-center rounded-lg transition-colors',
          layer.fontStyle === 'italic' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/8')}>
        <Italic className="w-3 h-3" />
      </button>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Align */}
      {([
        { v: 'left'   as const, icon: <AlignLeft  className="w-3 h-3" /> },
        { v: 'center' as const, icon: <AlignCenter className="w-3 h-3" /> },
        { v: 'right'  as const, icon: <AlignRight  className="w-3 h-3" /> },
      ]).map(({ v, icon }) => (
        <button key={v} onClick={() => upd({ align: v })}
          className={cn('w-6 h-6 flex items-center justify-center rounded-lg transition-colors',
            layer.align === v ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/8')}>
          {icon}
        </button>
      ))}

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Color swatch — shows current color, sidebar handles full picker */}
      <label className="cursor-pointer">
        <div className="w-5 h-5 rounded-md border border-white/20"
          style={{ background: layer.color }} />
        <input type="color" value={layer.color}
          onChange={(e) => updateTextLayer(layer.id, { color: e.target.value })}
          className="sr-only" />
      </label>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Delete */}
      <button onClick={() => deleteTextLayer(layer.id)}
        className="w-6 h-6 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}

// ── Text layer element ────────────────────────────────────────────────────────
export function TextOverlay({ frameWidth, frameHeight }: Props) {
  const store = useEditorStore()
  const { textLayers, selectedLayerId, animTemplateId } = store

  // Stable refs for each layer's DOM element
  const layerRefs  = useRef<Map<string, HTMLDivElement>>(new Map())
  // Track which layer is currently being edited inline
  const editingId  = useRef<string | null>(null)
  // Drag state
  const dragging   = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)

  // ── RAF animation loop ──────────────────────────────────────────────────
  useEffect(() => {
    function tick(now: number) {
      raf.id = requestAnimationFrame(tick)
      const delta = Math.min((now - raf.lastTime) / 1000, 0.1)
      raf.lastTime = now

      // Preview reset (triggered by effect button clicks)
      if (animClock.resetTextPreview) {
        raf.localElapsed = 0
        animClock.elapsedForText = 0
        animClock.paused = false
        animClock.resetTextPreview = false
      }

      if (!animClock.paused) {
        raf.localElapsed += delta
        animClock.elapsedForText = raf.localElapsed
      }

      // Seek — if no camera animation is active nobody else clears seekTo
      if (animClock.seekTo !== null) {
        raf.localElapsed = animClock.seekTo
        animClock.elapsedForText = animClock.seekTo
        if (!animTemplateId) animClock.seekTo = null
      }

      const t = animTemplateId ? animClock.elapsed : raf.localElapsed
      const template = animTemplateId ? ANIM_TEMPLATE_MAP[animTemplateId] : null
      const totalDuration = template
        ? template.keyframes.reduce((s, kf) => s + kf.duration, 0)
        : 10

      const layers = useEditorStore.getState().textLayers
      layers.forEach((layer) => {
        const el = layerRefs.current.get(layer.id)
        if (!el || editingId.current === layer.id) return
        const s = getTextLayerState(layer, t % totalDuration, totalDuration)
        el.style.opacity    = String(s.visible ? s.opacity : 0)
        el.style.transform  = `translate(-50%, -50%) ${s.transform}`
        el.style.filter     = s.filter
        el.style.clipPath   = s.clipPath
        el.style.visibility = s.visible ? 'visible' : 'hidden'
      })
    }

    raf.lastTime = performance.now()
    raf.id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.id)
  }, [animTemplateId])

  // ── Sync DOM text without triggering React re-render ───────────────────
  // We use a ref-based approach so that contentEditable never gets clobbered
  useEffect(() => {
    textLayers.forEach((layer) => {
      const el = layerRefs.current.get(layer.id)
      if (!el || editingId.current === layer.id) return
      // Only update if DOM diverged (covers external store changes)
      if (el.innerText !== layer.text) el.innerText = layer.text
    })
  })

  // ── Drag ────────────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: ReactPointerEvent, layer: TextLayer) => {
    if (layer.locked) return
    // Don't start drag on an active contentEditable layer
    if (editingId.current === layer.id) return
    e.currentTarget.setPointerCapture(e.pointerId)
    store.selectLayer(layer.id)
    dragging.current = { id: layer.id, startX: e.clientX, startY: e.clientY, origX: layer.x, origY: layer.y }
    e.stopPropagation()
  }, [store])

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    const d = dragging.current
    if (!d || frameWidth === 0 || frameHeight === 0) return
    const dx = ((e.clientX - d.startX) / frameWidth)  * 100
    const dy = ((e.clientY - d.startY) / frameHeight) * 100
    store.updateTextLayer(d.id, { x: d.origX + dx, y: d.origY + dy })
  }, [store, frameWidth, frameHeight])

  const onPointerUp = useCallback(() => { dragging.current = null }, [])

  // ── Double-click to edit inline ─────────────────────────────────────────
  const onDoubleClick = useCallback((e: ReactPointerEvent, layer: TextLayer) => {
    if (layer.locked) return
    editingId.current = layer.id
    const el = layerRefs.current.get(layer.id)
    if (!el) return
    el.contentEditable = 'true'
    el.style.cursor = 'text'
    el.focus()
    // Place cursor at end
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
    e.stopPropagation()
  }, [])

  const onBlur = useCallback((layer: TextLayer) => {
    const el = layerRefs.current.get(layer.id)
    if (!el) return
    const newText = el.innerText
    el.contentEditable = 'false'
    el.style.cursor = 'move'
    editingId.current = null
    // Commit to store only on blur — avoids re-renders while typing
    store.updateTextLayer(layer.id, { text: newText })
  }, [store])

  const onStagePointerDown = useCallback((e: ReactPointerEvent) => {
    if (e.target === e.currentTarget) store.selectLayer(null)
  }, [store])

  const selectedLayer = textLayers.find(l => l.id === selectedLayerId)

  if (textLayers.length === 0) return null

  return (
    <div
      className="absolute inset-0 z-10"
      style={{ pointerEvents: 'none' }}
      onPointerDown={onStagePointerDown as never}
    >
      {/* Floating toolbar for selected layer */}
      {selectedLayer && !selectedLayer.locked && frameWidth > 0 && (
        <FloatingToolbar
          layer={selectedLayer}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
        />
      )}

      {textLayers.map((layer) => {
        const isSelected = selectedLayerId === layer.id
        return (
          <div
            key={layer.id}
            ref={(el) => {
              if (el) {
                layerRefs.current.set(layer.id, el)
                // Initialise text content once on mount (avoids React-controlled clobber)
                if (el.innerText !== layer.text) el.innerText = layer.text
              } else {
                layerRefs.current.delete(layer.id)
              }
            }}
            onPointerDown={(e) => onPointerDown(e, layer)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDoubleClick={(e) => onDoubleClick(e, layer)}
            onBlur={() => onBlur(layer)}
            suppressContentEditableWarning
            style={{
              position: 'absolute',
              left: `${layer.x}%`,
              top:  `${layer.y}%`,
              width: `${layer.width}%`,
              transform: 'translate(-50%, -50%)',
              fontFamily: `"${layer.fontFamily}", sans-serif`,
              fontSize: `clamp(10px, ${(layer.fontSize / (frameWidth || 1080)) * 100}%, ${layer.fontSize}px)`,
              fontWeight: layer.fontWeight,
              fontStyle: layer.fontStyle,
              color: layer.color,
              textAlign: layer.align,
              letterSpacing: `${layer.letterSpacing}em`,
              lineHeight: layer.lineHeight,
              pointerEvents: layer.locked ? 'none' : 'auto',
              cursor: 'move',
              userSelect: 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              outline: 'none',
              borderRadius: 4,
              padding: '3px 6px',
              boxShadow: isSelected
                ? '0 0 0 1.5px rgba(99,102,241,0.8), 0 0 0 4px rgba(99,102,241,0.15)'
                : 'none',
              transition: 'box-shadow 0.1s ease',
            }}
          />
        )
      })}
    </div>
  )
}

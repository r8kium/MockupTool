import {
  useRef, useEffect, useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { animClock } from '@/lib/animClock'
import { getTextLayerState } from '@/lib/textAnimations'
import { ANIM_TEMPLATE_MAP } from '@/lib/animTemplates'
import type { TextLayer } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  /** Pixel dimensions of the canvas frame — used to convert drag deltas to % */
  frameWidth: number
  frameHeight: number
}

// Module-level RAF state — avoids creating closures per render
const rafRefs = {
  id: 0,
  lastTime: 0,
  localElapsed: 0,
}

export function TextOverlay({ frameWidth, frameHeight }: Props) {
  const store            = useEditorStore()
  const { textLayers, selectedLayerId, animTemplateId } = store
  const layerRefs        = useRef<Map<string, HTMLDivElement>>(new Map())
  const dragging         = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const editingId        = useRef<string | null>(null)

  // ── Animation RAF loop ──────────────────────────────────────────────────
  useEffect(() => {
    function tick(now: number) {
      rafRefs.id = requestAnimationFrame(tick)
      const delta = Math.min((now - rafRefs.lastTime) / 1000, 0.1)
      rafRefs.lastTime = now

      if (!animClock.paused) {
        rafRefs.localElapsed += delta
        animClock.elapsedForText = rafRefs.localElapsed
      }
      if (animClock.seekTo !== null) {
        rafRefs.localElapsed = animClock.seekTo
        animClock.elapsedForText = animClock.seekTo
      }

      // When camera animation is active, keep text in sync with it
      const t = animTemplateId ? animClock.elapsed : rafRefs.localElapsed

      const template = animTemplateId ? ANIM_TEMPLATE_MAP[animTemplateId] : null
      const totalDuration = template
        ? template.keyframes.reduce((s, kf) => s + kf.duration, 0)
        : 10  // fallback loop length for text-only mode

      const layers = useEditorStore.getState().textLayers

      layers.forEach((layer) => {
        const el = layerRefs.current.get(layer.id)
        if (!el) return
        const state = getTextLayerState(layer, t % totalDuration, totalDuration)
        el.style.opacity    = state.visible ? String(state.opacity) : '0'
        el.style.transform  = state.transform
        el.style.filter     = state.filter
        el.style.clipPath   = state.clipPath
        el.style.visibility = state.visible ? 'visible' : 'hidden'
      })
    }

    rafRefs.lastTime = performance.now()
    rafRefs.id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRefs.id)
  }, [animTemplateId])

  // ── Drag to reposition ──────────────────────────────────────────────────
  const onPointerDown = useCallback((e: ReactPointerEvent, layer: TextLayer) => {
    if (layer.locked || editingId.current === layer.id) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = { id: layer.id, startX: e.clientX, startY: e.clientY, origX: layer.x, origY: layer.y }
    store.selectLayer(layer.id)
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
    el.focus()
    // Select all
    const range = document.createRange()
    range.selectNodeContents(el)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
    e.stopPropagation()
  }, [])

  const onBlur = useCallback((layer: TextLayer) => {
    const el = layerRefs.current.get(layer.id)
    if (!el) return
    store.updateTextLayer(layer.id, { text: el.innerText })
    el.contentEditable = 'false'
    editingId.current = null
  }, [store])

  // Deselect on stage click
  const onStageClick = useCallback((e: ReactPointerEvent) => {
    if (e.target === e.currentTarget) store.selectLayer(null)
  }, [store])

  if (textLayers.length === 0) return null

  return (
    <div
      className="absolute inset-0 z-10"
      style={{ pointerEvents: 'none' }}
      onPointerDown={onStageClick as never}
    >
      {textLayers.map((layer) => {
        const isSelected = selectedLayerId === layer.id
        return (
          <div
            key={layer.id}
            ref={(el) => {
              if (el) layerRefs.current.set(layer.id, el)
              else layerRefs.current.delete(layer.id)
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
              top: `${layer.y}%`,
              width: `${layer.width}%`,
              transform: 'translate(-50%, -50%)',
              fontFamily: `"${layer.fontFamily}", sans-serif`,
              fontSize: `clamp(12px, ${layer.fontSize / 10}vw, ${layer.fontSize}px)`,
              fontWeight: layer.fontWeight,
              fontStyle: layer.fontStyle,
              color: layer.color,
              textAlign: layer.align,
              letterSpacing: `${layer.letterSpacing}em`,
              lineHeight: layer.lineHeight,
              pointerEvents: layer.locked ? 'none' : 'auto',
              cursor: layer.locked ? 'default' : 'move',
              userSelect: 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              outline: 'none',
              // Selection ring
              boxShadow: isSelected ? '0 0 0 1px rgba(99,102,241,0.7), 0 0 0 3px rgba(99,102,241,0.2)' : 'none',
              borderRadius: 2,
              padding: '2px 4px',
            }}
          >
            {layer.text}
          </div>
        )
      })}
    </div>
  )
}

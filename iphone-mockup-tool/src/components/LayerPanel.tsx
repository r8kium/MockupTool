import { Box, Eye, EyeOff, Lock, Unlock, Trash2, Type } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { cn } from '@/lib/utils'

export function LayerPanel() {
  const { textLayers, selectedLayerId, selectLayer, updateTextLayer, deleteTextLayer, reorderTextLayers } = useEditorStore()

  return (
    <div className="space-y-1">
      {/* 3D Mockup — always the base layer */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border border-white/5">
        <Box className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
        <span className="text-xs text-white/40 flex-1 truncate">3D Mockup</span>
        <span className="text-[9px] text-white/20 uppercase tracking-wide">base</span>
      </div>

      {/* Text layers — bottom of array = lowest z-order */}
      {[...textLayers].reverse().map((layer, reversedIdx) => {
        const realIdx = textLayers.length - 1 - reversedIdx
        const selected = selectedLayerId === layer.id
        return (
          <div
            key={layer.id}
            onClick={() => selectLayer(layer.id)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition-all group',
              selected
                ? 'bg-indigo-500/10 border-indigo-500/30'
                : 'bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10'
            )}
          >
            <Type className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            <span className="text-xs text-white/70 flex-1 truncate">{layer.text.slice(0, 24) || 'Empty'}</span>

            {/* Controls */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); updateTextLayer(layer.id, { visible: !layer.visible }) }}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); updateTextLayer(layer.id, { locked: !layer.locked }) }}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteTextLayer(layer.id) }}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Drag reorder handles */}
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize"
              onPointerDown={(e) => {
                e.stopPropagation()
                const startY = e.clientY
                const onMove = (ev: PointerEvent) => {
                  const dy = ev.clientY - startY
                  const step = Math.round(dy / 28)
                  if (step !== 0) {
                    const newIdx = Math.max(0, Math.min(textLayers.length - 1, realIdx + step))
                    if (newIdx !== realIdx) reorderTextLayers(realIdx, newIdx)
                  }
                }
                const onUp = () => {
                  window.removeEventListener('pointermove', onMove)
                  window.removeEventListener('pointerup', onUp)
                }
                window.addEventListener('pointermove', onMove)
                window.addEventListener('pointerup', onUp)
              }}
            >
              {[0,1,2].map(i => <div key={i} className="w-2.5 h-px bg-white/20 rounded-full" />)}
            </div>
          </div>
        )
      })}

      {textLayers.length === 0 && (
        <p className="text-xs text-white/20 text-center py-3">No text layers yet</p>
      )}
    </div>
  )
}

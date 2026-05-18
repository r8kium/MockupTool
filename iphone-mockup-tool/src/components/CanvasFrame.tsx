import { useRef, useEffect, type ReactNode } from 'react'
import type { CanvasPreset } from '@/lib/canvasPresets'

interface Props {
  preset: CanvasPreset | null
  children: ReactNode
  /** Called with the frame's current pixel dimensions — used by TextOverlay for coordinate math */
  onResize?: (w: number, h: number) => void
}

export function CanvasFrame({ preset, children, onResize }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onResize || !frameRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      onResize(entry.contentRect.width, entry.contentRect.height)
    })
    ro.observe(frameRef.current)
    return () => ro.disconnect()
  }, [onResize])

  if (!preset) {
    return (
      <div ref={frameRef} className="relative w-full h-full">
        {children}
      </div>
    )
  }

  const ar = preset.width / preset.height

  return (
    // Stage — dark area surrounding the frame
    <div className="flex-1 min-h-0 flex items-center justify-center bg-[#080808] overflow-hidden p-6">
      {/* Frame — fixed aspect ratio, scales to fit stage */}
      <div
        ref={frameRef}
        className="relative overflow-hidden shadow-2xl"
        style={{
          aspectRatio: `${ar}`,
          maxHeight: '100%',
          maxWidth: '100%',
          // height fills the stage; width is clamped by max-width
          height: ar < 1 ? '100%' : 'auto',
          width:  ar >= 1 ? '100%' : 'auto',
        }}
      >
        {/* Subtle frame border */}
        <div className="absolute inset-0 ring-1 ring-white/10 pointer-events-none z-20" />
        {/* Format label */}
        <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded text-[9px] font-medium text-white/30 bg-black/40 backdrop-blur-sm pointer-events-none">
          {preset.width}×{preset.height}
        </div>
        {children}
      </div>
    </div>
  )
}

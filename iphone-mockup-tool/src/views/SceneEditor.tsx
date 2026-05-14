import { useRef, useState } from 'react'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import type { ThreeCanvasRef } from '@/components/ThreeCanvas'
import { useEditorStore } from '@/store/useEditorStore'
import { readFileAsDataUrl } from '@/lib/utils'
import type { SceneTemplate } from '@/types'

interface Props {
  scene: SceneTemplate
  onBack: () => void
}

export function SceneEditor({ scene, onBack }: Props) {
  const canvasRef = useRef<ThreeCanvasRef | null>(null)
  const state = useEditorStore()
  const [slots, setSlots] = useState<Record<number, string | null>>({})

  const setSlot = (i: number, url: string | null) =>
    setSlots((prev) => ({ ...prev, [i]: url }))

  const handleExport = () => {
    const url = canvasRef.current?.exportPNG()
    if (!url) return
    Object.assign(document.createElement('a'), {
      href: url,
      download: `${scene.name.toLowerCase().replace(/\s+/g, '-')}-scene.png`,
    }).click()
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Scenes
          </button>
          <span className="text-white/15">|</span>
          <span className="text-sm font-medium text-white/80">{scene.name}</span>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export Image
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative min-h-0">
          {!scene.slots.every((_, i) => slots[i]) && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <p className="text-xs text-white/30 bg-black/30 rounded-full px-4 py-1.5 backdrop-blur-sm">
                Click each device screen to upload a screenshot
              </p>
            </div>
          )}
          <ThreeCanvas
            state={state}
            canvasRef={canvasRef}
            sceneTemplate={scene}
            slotScreenshots={slots}
            onSlotScreenshotUpload={(i, url) => setSlot(i, url)}
          />
        </div>

        <aside className="w-[280px] flex-shrink-0 bg-[#252525] border-l border-white/5 overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Screenshots</p>
            <p className="text-xs text-white/30 mt-1">Click a screen in the viewport or upload here</p>
          </div>
          <div className="p-4 space-y-3">
            {scene.slots.map((slot, i) => (
              <SlotUpload
                key={i}
                label={slot.label}
                screenshot={slots[i] ?? null}
                onUpload={(url) => setSlot(i, url)}
                onClear={() => setSlot(i, null)}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function SlotUpload({ label, screenshot, onUpload, onClear }: {
  label: string
  screenshot: string | null
  onUpload: (dataUrl: string) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(await readFileAsDataUrl(file))
    e.target.value = ''
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-white/50">{label}</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {screenshot ? (
        <div className="relative rounded-lg overflow-hidden border border-white/10 group">
          <img src={screenshot} alt={label} className="w-full h-20 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => inputRef.current?.click()}
              className="text-xs text-white bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors">
              Replace
            </button>
            <button onClick={onClear}
              className="text-xs text-white bg-red-500/60 hover:bg-red-500/80 rounded px-2 py-1 transition-colors">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          className="w-full h-20 rounded-lg border-2 border-dashed border-white/15 hover:border-white/30 flex items-center justify-center gap-2 transition-colors text-white/30 hover:text-white/50">
          <Upload className="w-4 h-4" />
          <span className="text-xs">Upload screenshot</span>
        </button>
      )}
    </div>
  )
}

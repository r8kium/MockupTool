import { useRef, useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ChevronDown, Download, Film, Upload } from 'lucide-react'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import type { ThreeCanvasRef } from '@/components/ThreeCanvas'
import { AnimSection } from '@/components/AnimSection'
import { SeekBar } from '@/components/SeekBar'
import { useEditorStore } from '@/store/useEditorStore'
import { ANIM_TEMPLATE_MAP } from '@/lib/animTemplates'
import { readFileAsDataUrl } from '@/lib/utils'
import { exportAnimationMp4 } from '@/lib/exportMp4'
import type { SceneTemplate } from '@/types'

interface Props {
  scene: SceneTemplate
  onBack: () => void
}

export function SceneEditor({ scene, onBack }: Props) {
  const canvasRef = useRef<ThreeCanvasRef | null>(null)
  const menuRef   = useRef<HTMLDivElement>(null)
  const state     = useEditorStore()
  const animTemplate = state.animTemplateId ? ANIM_TEMPLATE_MAP[state.animTemplateId] ?? null : null

  const [slots,          setSlots]          = useState<Record<number, string | null>>({})
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null)

  const setSlot = (i: number, url: string | null) =>
    setSlots((prev) => ({ ...prev, [i]: url }))

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleExportPng = useCallback(() => {
    const url = canvasRef.current?.exportPNG()
    if (!url) return
    Object.assign(document.createElement('a'), {
      href: url,
      download: `${scene.name.toLowerCase().replace(/\s+/g, '-')}-scene.png`,
    }).click()
    setMenuOpen(false)
  }, [scene.name])

  const handleExportMp4 = useCallback(async () => {
    const ctx = canvasRef.current?.getThreeContext()
    if (!ctx || !animTemplate) return
    setMenuOpen(false)
    setExportProgress({ current: 0, total: 0 })
    try {
      const blob = await exportAnimationMp4(
        ctx.gl, ctx.scene, ctx.camera, animTemplate,
        (current, total) => setExportProgress({ current, total }),
      )
      const url = URL.createObjectURL(blob)
      Object.assign(document.createElement('a'), {
        href: url,
        download: `${scene.name.toLowerCase().replace(/\s+/g, '-')}-animation.mp4`,
      }).click()
      URL.revokeObjectURL(url)
    } finally {
      setExportProgress(null)
    }
  }, [animTemplate, scene.name])

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

        {/* Export dropdown */}
        {exportProgress ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2a2a2a] border border-white/10 text-white/50">
            Exporting {exportProgress.current} / {exportProgress.total}…
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <div className="flex items-center">
              <button onClick={handleExportPng}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button onClick={() => setMenuOpen((v) => !v)}
                className="px-1.5 py-1.5 rounded-r-lg bg-blue-700 hover:bg-blue-600 text-white border-l border-blue-500/40 transition-colors">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[168px]">
                <button onClick={handleExportPng}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export Frame
                </button>
                {animTemplate && (
                  <button onClick={handleExportMp4}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors">
                    <Film className="w-3.5 h-3.5" />
                    Export Animation
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* 3D Viewport + SeekBar */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative flex-1 min-h-0">
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
              animTemplate={animTemplate}
            />
          </div>
          {animTemplate && <SeekBar animTemplate={animTemplate} />}
        </div>

        <aside className="w-[280px] flex-shrink-0 bg-[#252525] border-l border-white/5 overflow-y-auto">
          {/* Animation */}
          <div className="border-b border-white/5">
            <p className="px-4 py-3 text-xs font-semibold text-white/60 uppercase tracking-wider">Animation</p>
            <div className="px-4 pb-4">
              <AnimSection screenshot={null} />
            </div>
          </div>

          {/* Screenshots */}
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

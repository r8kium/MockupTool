import { useRef, useCallback, useState, useEffect } from 'react'
import { ArrowLeft, ChevronDown, Download, Film, RotateCcw, Upload } from 'lucide-react'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import type { ThreeCanvasRef } from '@/components/ThreeCanvas'
import { RightPanel } from '@/components/RightPanel'
import { SeekBar } from '@/components/SeekBar'
import { useEditorStore } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'
import { ANIM_TEMPLATE_MAP } from '@/lib/animTemplates'
import { readFileAsDataUrl } from '@/lib/utils'
import { exportAnimationMp4 } from '@/lib/exportMp4'

interface Props {
  onBack: () => void
}

export function Editor({ onBack }: Props) {
  const canvasRef  = useRef<ThreeCanvasRef | null>(null)
  const uploadRef  = useRef<HTMLInputElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)
  const state      = useEditorStore()
  const device     = DEVICE_MODELS[state.deviceId]
  const animTemplate = state.animTemplateId ? ANIM_TEMPLATE_MAP[state.animTemplateId] ?? null : null

  const [menuOpen,       setMenuOpen]       = useState(false)
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) state.setScreenshot(await readFileAsDataUrl(file))
    e.target.value = ''
  }, [state])

  const handleExportPng = useCallback(() => {
    const dataUrl = canvasRef.current?.exportPNG(); if (!dataUrl) return
    Object.assign(document.createElement('a'), {
      href: dataUrl,
      download: `${device.name.toLowerCase().replace(/\s+/g, '-')}-mockup.png`,
    }).click()
    setMenuOpen(false)
  }, [device.name])

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
        download: `${device.name.toLowerCase().replace(/\s+/g, '-')}-animation.mp4`,
      }).click()
      URL.revokeObjectURL(url)
    } finally {
      setExportProgress(null)
    }
  }, [animTemplate, device.name])

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Devices
          </button>
          <span className="text-white/15">|</span>
          <span className="text-sm font-medium text-white/80">{device.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button onClick={() => uploadRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          <button onClick={state.reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

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
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* 3D Viewport + SeekBar */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative flex-1 min-h-0">
            {!state.screenshot && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <p className="text-xs text-white/30 bg-black/30 rounded-full px-4 py-1.5 backdrop-blur-sm">
                  Click the device screen to upload a screenshot
                </p>
              </div>
            )}
            <ThreeCanvas
              state={state}
              canvasRef={canvasRef}
              onScreenshotUpload={state.setScreenshot}
              animTemplate={animTemplate}
            />
          </div>
          {animTemplate && <SeekBar animTemplate={animTemplate} />}
        </div>

        {/* Right panel */}
        <RightPanel onOpenBrowser={onBack} />
      </div>
    </div>
  )
}

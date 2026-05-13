import { useRef, useCallback } from 'react'
import { ArrowLeft, Download, RotateCcw, Upload } from 'lucide-react'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import type { ThreeCanvasRef } from '@/components/ThreeCanvas'
import { RightPanel } from '@/components/RightPanel'
import { useEditorStore } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'

interface Props {
  onBack: () => void
}

export function Editor({ onBack }: Props) {
  const canvasRef = useRef<ThreeCanvasRef | null>(null)
  const state = useEditorStore()
  const device = DEVICE_MODELS[state.deviceId]

  const handleUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/webp'
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => state.setScreenshot(e.target?.result as string)
      reader.readAsDataURL(file)
    }
    input.click()
  }, [state])

  const handleExport = useCallback(() => {
    const dataUrl = canvasRef.current?.exportPNG(); if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${device.name.toLowerCase().replace(/\s+/g, '-')}-mockup.png`
    a.click()
  }, [device.name])

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
          <button onClick={handleUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          <button onClick={state.reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export Image
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* 3D Viewport */}
        <div className="flex-1 relative min-h-0">
          {!state.screenshot && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div
                onClick={handleUpload}
                className="pointer-events-auto flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-white/35 cursor-pointer transition-colors"
              >
                <Upload className="w-7 h-7 text-white/25" />
                <div className="text-center">
                  <p className="text-sm font-medium text-white/50">Drop screenshot here</p>
                  <p className="text-xs text-white/25 mt-0.5">or click to browse</p>
                </div>
              </div>
            </div>
          )}
          <ThreeCanvas state={state} canvasRef={canvasRef} />
        </div>

        {/* Right panel */}
        <RightPanel onOpenBrowser={onBack} />
      </div>
    </div>
  )
}

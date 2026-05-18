import { useRef, useCallback, useState, useEffect } from 'react'
import {
  ArrowLeft, ChevronDown, Download, Film, RotateCcw,
  Upload, Plus, LayoutTemplate,
} from 'lucide-react'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import type { ThreeCanvasRef } from '@/components/ThreeCanvas'
import { RightPanel } from '@/components/RightPanel'
import { UniversalTimeline } from '@/components/UniversalTimeline'
import { CanvasFrame } from '@/components/CanvasFrame'
import { TextOverlay } from '@/components/TextOverlay'
import { useEditorStore } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'
import { ANIM_TEMPLATE_MAP } from '@/lib/animTemplates'
import { readFileAsDataUrl } from '@/lib/utils'
import { exportAnimationMp4 } from '@/lib/exportMp4'
import { CANVAS_PRESETS, CANVAS_PRESET_MAP } from '@/lib/canvasPresets'
import { animClock } from '@/lib/animClock'
import { cn } from '@/lib/utils'

interface Props { onBack: () => void }

const PRESET_GROUPS = ['Vertical', 'Square', 'Landscape', 'App Store'] as const

export function Editor({ onBack }: Props) {
  const canvasRef     = useRef<ThreeCanvasRef | null>(null)
  const uploadRef     = useRef<HTMLInputElement>(null)
  const menuRef       = useRef<HTMLDivElement>(null)
  const presetMenuRef = useRef<HTMLDivElement>(null)
  const state         = useEditorStore()
  const device        = DEVICE_MODELS[state.deviceId]
  const animTemplate  = state.animTemplateId ? ANIM_TEMPLATE_MAP[state.animTemplateId] ?? null : null
  const activePreset  = state.canvasPresetId ? CANVAS_PRESET_MAP[state.canvasPresetId] ?? null : null

  const [menuOpen,        setMenuOpen]        = useState(false)
  const [presetMenuOpen,  setPresetMenuOpen]  = useState(false)
  const [exportProgress,  setExportProgress]  = useState<{ current: number; total: number } | null>(null)
  const [frameSize,       setFrameSize]       = useState({ w: 0, h: 0 })

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (presetMenuRef.current && !presetMenuRef.current.contains(e.target as Node)) setPresetMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      // Skip when typing in inputs/textareas/contentEditable
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement).isContentEditable) return

      if (e.code === 'Space') {
        e.preventDefault()
        animClock.paused = !animClock.paused
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        animClock.seekTo = 0
        animClock.resetTextPreview = true
        animClock.paused = false
      }
      if (e.key === 'Escape') {
        state.selectLayer(null)
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedLayerId) {
        e.preventDefault()
        state.deleteTextLayer(state.selectedLayerId)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state])

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
        state.textLayers,
        (current, total) => setExportProgress({ current, total }),
      )
      const url = URL.createObjectURL(blob)
      Object.assign(document.createElement('a'), {
        href: url, download: `${device.name.toLowerCase().replace(/\s+/g, '-')}-animation.mp4`,
      }).click()
      URL.revokeObjectURL(url)
    } finally {
      setExportProgress(null)
    }
  }, [animTemplate, device.name, state.textLayers])

  const handleAddText = useCallback(() => {
    state.addTextLayer()
    // Restart preview so the new layer's entrance animation plays immediately
    animClock.resetTextPreview = true
    animClock.paused = false
  }, [state])

  const handleFrameResize = useCallback((w: number, h: number) => {
    setFrameSize({ w, h })
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-white overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#111111] border-b border-white/[0.06] flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-colors flex-shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium tracking-wide uppercase">Mockup Tool</span>
          </button>
          <span className="text-white/10">/</span>
          <span className="text-sm font-medium text-white/70 truncate">{device.name}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Canvas format picker */}
          <div className="relative" ref={presetMenuRef}>
            <button
              onClick={() => setPresetMenuOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              {activePreset ? activePreset.name : 'Free Canvas'}
              <ChevronDown className="w-3 h-3 text-white/30" />
            </button>
            {presetMenuOpen && (
              <div className="absolute left-0 top-full mt-1 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden w-72 max-h-[480px] overflow-y-auto">
                {/* Free canvas option */}
                <button
                  onClick={() => { state.setCanvasPreset(null); setPresetMenuOpen(false) }}
                  className={cn(
                    'flex items-center justify-between w-full px-4 py-2.5 text-xs hover:bg-white/5 transition-colors border-b border-white/5',
                    !activePreset ? 'text-white' : 'text-white/50'
                  )}
                >
                  <span>Free Canvas</span>
                  {!activePreset && <span className="text-white/30 text-[10px]">✓</span>}
                </button>
                {PRESET_GROUPS.map(group => {
                  const presets = CANVAS_PRESETS.filter(p => p.group === group)
                  return (
                    <div key={group}>
                      <div className="px-4 pt-2.5 pb-1">
                        <span className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">{group}</span>
                      </div>
                      {presets.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => { state.setCanvasPreset(preset.id); setPresetMenuOpen(false) }}
                          className={cn(
                            'flex items-center justify-between w-full px-4 py-2 text-xs hover:bg-white/5 transition-colors',
                            state.canvasPresetId === preset.id ? 'text-white' : 'text-white/60'
                          )}
                        >
                          <div>
                            <span className="font-medium">{preset.name}</span>
                            <span className="text-white/25 ml-2">{preset.platform}</span>
                          </div>
                          <span className="text-white/25 text-[10px] font-mono">{preset.width}×{preset.height}</span>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add text */}
          <button onClick={handleAddText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Text
          </button>

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

          {/* Export */}
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
                <button onClick={() => setMenuOpen(v => !v)}
                  className="px-1.5 py-1.5 rounded-r-lg bg-blue-700 hover:bg-blue-600 text-white border-l border-blue-500/40 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[168px]">
                  <button onClick={handleExportPng}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Export Frame (PNG)
                  </button>
                  {animTemplate && (
                    <button onClick={handleExportMp4}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors">
                      <Film className="w-3.5 h-3.5" />
                      Export Animation (MP4)
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

        {/* Viewport */}
        <div className="flex-1 flex flex-col min-h-0">
          {activePreset ? (
            // Fixed-AR canvas mode
            <CanvasFrame preset={activePreset} onResize={handleFrameResize}>
              <ThreeCanvas
                state={state}
                canvasRef={canvasRef}
                onScreenshotUpload={state.setScreenshot}
                animTemplate={animTemplate}
              />
              <TextOverlay frameWidth={frameSize.w} frameHeight={frameSize.h} />
            </CanvasFrame>
          ) : (
            // Free canvas mode
            <div className="relative flex-1 min-h-0" ref={(el) => {
              if (!el) return
              const ro = new ResizeObserver(([entry]) => {
                const { width, height } = entry.contentRect
                setFrameSize(prev => (prev.w === width && prev.h === height) ? prev : { w: width, h: height })
              })
              ro.observe(el)
              // ResizeObserver is not returned from the ref callback; it will be cleaned up when el unmounts
              // (minor leak acceptable for a single element)
            }}>
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
              <TextOverlay frameWidth={frameSize.w} frameHeight={frameSize.h} />
            </div>
          )}
          <UniversalTimeline animTemplate={animTemplate} />
        </div>

        {/* Right panel */}
        <RightPanel onOpenBrowser={onBack} />
      </div>
    </div>
  )
}

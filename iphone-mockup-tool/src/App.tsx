import { useEffect, useRef } from 'react'
import { Moon, Sun, RotateCcw, Smartphone } from 'lucide-react'
import { ThreeCanvas } from '@/components/ThreeCanvas'
import type { ThreeCanvasRef } from '@/components/ThreeCanvas'
import { UploadZone } from '@/components/UploadZone'
import { DevicePicker } from '@/components/DevicePicker'
import { ColorPicker } from '@/components/ColorPicker'
import { BackgroundControls } from '@/components/BackgroundControls'
import { ExportControls } from '@/components/ExportControls'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store/useEditorStore'
import { useDarkMode } from '@/hooks/useDarkMode'

export default function App() {
  const state = useEditorStore()
  const canvasRef = useRef<ThreeCanvasRef | null>(null)
  const uploadRef = useRef<HTMLDivElement>(null)
  const { dark, toggle: toggleDark } = useDarkMode()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'u' || e.key === 'U') {
        uploadRef.current?.querySelector('input')?.click()
      }
      if (e.key === 'd' || e.key === 'D') {
        document.querySelector<HTMLButtonElement>('[data-export="1"]')?.click()
      }
      if (e.key === 'r' || e.key === 'R') {
        state.reset()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          <span className="font-semibold tracking-tight">iPhone Mockup</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDark} title="Toggle dark mode">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={state.reset} title="Reset (R)">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
        </div>
      </header>

      <main className="flex-1 grid lg:grid-cols-[1fr_380px] overflow-hidden">
        {/* 3D viewport — always visible */}
        <div className="relative bg-muted/20 min-h-[60vh] lg:min-h-auto">
          {!state.screenshot && (
            <div className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none z-10">
              <p className="text-sm text-muted-foreground bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                Upload a screenshot to place it on the screen
              </p>
            </div>
          )}
          <ThreeCanvas state={state} canvasRef={canvasRef} />
        </div>

        <aside className="border-l overflow-y-auto">
          <div className="p-5 space-y-6">
            <div ref={uploadRef}>
              <UploadZone />
            </div>
            <hr className="border-border" />
            <DevicePicker />
            <ColorPicker />
            <hr className="border-border" />
            <BackgroundControls />
            <hr className="border-border" />
            <ExportControls canvasRef={canvasRef} />
            <KeyboardHelp />
          </div>
        </aside>
      </main>
    </div>
  )
}

function KeyboardHelp() {
  return (
    <div className="text-xs text-muted-foreground space-y-1 pt-2">
      <p className="font-medium">Keyboard shortcuts</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span>
          <kbd className="font-mono bg-muted px-1 rounded">U</kbd> Upload
        </span>
        <span>
          <kbd className="font-mono bg-muted px-1 rounded">D</kbd> Download
        </span>
        <span>
          <kbd className="font-mono bg-muted px-1 rounded">R</kbd> Reset
        </span>
        <span>
          <kbd className="font-mono bg-muted px-1 rounded">Drag</kbd> Orbit
        </span>
      </div>
    </div>
  )
}

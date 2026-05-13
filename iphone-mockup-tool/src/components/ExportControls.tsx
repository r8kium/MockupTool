import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store/useEditorStore'
import type { ThreeCanvasRef } from '@/components/ThreeCanvas'
import { saveAs } from 'file-saver'

interface ExportControlsProps {
  canvasRef: React.MutableRefObject<ThreeCanvasRef | null>
}

export function ExportControls({ canvasRef }: ExportControlsProps) {
  const { deviceId } = useEditorStore()
  const [saved, setSaved] = useState(false)

  const handleExport = () => {
    const dataUrl = canvasRef.current?.exportPNG()
    if (!dataUrl) return
    const ts = Date.now()
    saveAs(dataUrl, `mockup-${deviceId}-${ts}.png`)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Export</p>
      <Button
        data-export="1"
        variant={saved ? 'default' : 'outline'}
        size="sm"
        onClick={handleExport}
        className="w-full"
      >
        {saved ? <Check className="w-3.5 h-3.5 mr-1" /> : <Download className="w-3.5 h-3.5 mr-1" />}
        {saved ? 'Saved!' : 'Download PNG'}
      </Button>
    </div>
  )
}

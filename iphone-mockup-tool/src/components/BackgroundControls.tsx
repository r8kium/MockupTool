import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useEditorStore } from '@/store/useEditorStore'
import type { BackgroundConfig, BackgroundType } from '@/types'

const PRESET_GRADIENTS = [
  { from: '#6366f1', to: '#8b5cf6', label: 'Purple' },
  { from: '#0ea5e9', to: '#2dd4bf', label: 'Ocean' },
  { from: '#f59e0b', to: '#ef4444', label: 'Sunset' },
  { from: '#10b981', to: '#0ea5e9', label: 'Mint' },
  { from: '#1e1b4b', to: '#312e81', label: 'Midnight' },
]

function BgImageDropzone() {
  const { setBackground, background } = useEditorStore()
  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackground({ type: 'image', imageDataUrl: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    },
    [setBackground]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <div
      {...getRootProps()}
      className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors"
    >
      <input {...getInputProps()} />
      <p className="text-xs text-muted-foreground">
        {isDragActive
          ? 'Drop image'
          : background.imageDataUrl
            ? 'Background set — drop to replace'
            : 'Drop or click to set background image'}
      </p>
    </div>
  )
}

export function BackgroundControls() {
  const { background, setBackground, shadow, toggleShadow, cameraAngle, setCameraAngle } =
    useEditorStore()

  const setType = (type: BackgroundType) => {
    const next: BackgroundConfig = { ...background, type }
    if (type === 'solid' && !next.solidColor) next.solidColor = '#ffffff'
    if (type === 'gradient') {
      if (!next.gradientFrom) next.gradientFrom = '#6366f1'
      if (!next.gradientTo) next.gradientTo = '#8b5cf6'
      if (next.gradientAngle === undefined) next.gradientAngle = 135
    }
    setBackground(next)
  }

  return (
    <div className="space-y-4">
      {/* Camera angle */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">View</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(['front', 'isometric', 'side'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => setCameraAngle(angle)}
              className={`px-2 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                cameraAngle === angle
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              {angle}
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Background
        </p>
        <Tabs value={background.type} onValueChange={(v) => setType(v as BackgroundType)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="transparent">None</TabsTrigger>
            <TabsTrigger value="solid">Solid</TabsTrigger>
            <TabsTrigger value="gradient">Grad</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>

          <TabsContent value="transparent">
            <p className="text-xs text-muted-foreground pt-2">Transparent background.</p>
          </TabsContent>

          <TabsContent value="solid" className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background.solidColor ?? '#ffffff'}
                onChange={(e) => setBackground({ ...background, solidColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border"
              />
              <Input
                value={background.solidColor ?? '#ffffff'}
                onChange={(e) => setBackground({ ...background, solidColor: e.target.value })}
                className="font-mono text-sm"
                maxLength={7}
              />
            </div>
          </TabsContent>

          <TabsContent value="gradient" className="pt-2 space-y-3">
            <div className="flex flex-wrap gap-2 mb-1">
              {PRESET_GRADIENTS.map((g) => (
                <button
                  key={g.label}
                  title={g.label}
                  onClick={() =>
                    setBackground({ ...background, gradientFrom: g.from, gradientTo: g.to })
                  }
                  className="w-7 h-7 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg,${g.from},${g.to})` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={background.gradientFrom ?? '#6366f1'}
                    onChange={(e) =>
                      setBackground({ ...background, gradientFrom: e.target.value })
                    }
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <Input
                    value={background.gradientFrom ?? '#6366f1'}
                    onChange={(e) =>
                      setBackground({ ...background, gradientFrom: e.target.value })
                    }
                    className="font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={background.gradientTo ?? '#8b5cf6'}
                    onChange={(e) => setBackground({ ...background, gradientTo: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <Input
                    value={background.gradientTo ?? '#8b5cf6'}
                    onChange={(e) => setBackground({ ...background, gradientTo: e.target.value })}
                    className="font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Angle: {background.gradientAngle ?? 135}°</Label>
              <Slider
                min={0}
                max={360}
                step={5}
                value={[background.gradientAngle ?? 135]}
                onValueChange={([v]) => setBackground({ ...background, gradientAngle: v })}
              />
            </div>
          </TabsContent>

          <TabsContent value="image" className="pt-2">
            <BgImageDropzone />
          </TabsContent>
        </Tabs>
      </div>

      {/* Shadow */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shadow</p>
        <button
          onClick={toggleShadow}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            shadow ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              shadow ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

import { DEVICE_MODELS } from '@/lib/frames'
import { useEditorStore } from '@/store/useEditorStore'
import { cn } from '@/lib/utils'

export function ColorPicker() {
  const { deviceId, colorId, setColor } = useEditorStore()
  const device = DEVICE_MODELS[deviceId]

  if (device.colors.length <= 1) return null

  const active = device.colors.find((c) => c.id === colorId)

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Color</p>
      <div className="flex flex-wrap gap-2">
        {device.colors.map((color) => (
          <button
            key={color.id}
            title={color.label}
            onClick={() => setColor(color.id)}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-all',
              colorId === color.id
                ? 'border-primary scale-110 shadow-md'
                : 'border-border hover:border-primary/50'
            )}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
      {active && <p className="text-xs text-muted-foreground">{active.label}</p>}
    </div>
  )
}

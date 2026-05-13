import { DEVICE_LIST } from '@/lib/frames'
import { useEditorStore } from '@/store/useEditorStore'
import { cn } from '@/lib/utils'

export function DevicePicker() {
  const { deviceId, setDevice, setColor } = useEditorStore()

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Device</p>
      <div className="grid grid-cols-2 gap-2">
        {DEVICE_LIST.map((device) => (
          <button
            key={device.id}
            onClick={() => {
              setDevice(device.id)
              setColor(device.colors[0].id)
            }}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left',
              deviceId === device.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            {device.name}
          </button>
        ))}
      </div>
    </div>
  )
}

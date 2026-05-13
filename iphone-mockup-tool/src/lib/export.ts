import { saveAs } from 'file-saver'
import type { DeviceId } from '@/types'

export async function exportPNG(
  canvas: HTMLCanvasElement,
  scale: 1 | 2 | 3,
  deviceId: DeviceId
): Promise<void> {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = canvas.width * scale
  exportCanvas.height = canvas.height * scale

  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  ctx.scale(scale, scale)
  ctx.drawImage(canvas, 0, 0)

  exportCanvas.toBlob(
    (blob) => {
      if (!blob) return
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      saveAs(blob, `mockup-${deviceId}-${scale}x-${timestamp}.png`)
    },
    'image/png',
    1
  )
}

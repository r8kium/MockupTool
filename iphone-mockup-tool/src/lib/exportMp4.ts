import * as THREE from 'three'
import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import type { AnimTemplate, TextLayer } from '@/types'
import { animClock } from './animClock'
import { evalBezier } from './utils'
import { getTextLayerState } from './textAnimations'

function setCameraAtTime(camera: THREE.Camera, template: AnimTemplate, t: number) {
  const kfs = template.keyframes
  const n = kfs.length
  let segStart = 0
  for (let i = 0; i < n; i++) {
    const segEnd = segStart + kfs[i].duration
    if (t <= segEnd || i === n - 1) {
      const progress = kfs[i].duration > 0 ? Math.min((t - segStart) / kfs[i].duration, 1) : 1
      const [c1x, c1y, c2x, c2y] = kfs[i].easing
      const ep = evalBezier(c1x, c1y, c2x, c2y, progress)
      const next = kfs[(i + 1) % n]
      const cx = kfs[i].cam[0] + (next.cam[0] - kfs[i].cam[0]) * ep
      const cy = kfs[i].cam[1] + (next.cam[1] - kfs[i].cam[1]) * ep
      const cz = kfs[i].cam[2] + (next.cam[2] - kfs[i].cam[2]) * ep
      const roll = kfs[i].roll + (next.roll - kfs[i].roll) * ep
      camera.position.set(cx, cy, cz)
      camera.lookAt(0, 0, 0)
      camera.rotateZ((roll * Math.PI) / 180)
      break
    }
    segStart = segEnd
  }
}

// ── Text compositing via Canvas 2D ───────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

async function ensureFontsLoaded(layers: TextLayer[]) {
  const promises = layers.map(l =>
    document.fonts.load(`${l.fontStyle === 'italic' ? 'italic ' : ''}${l.fontWeight} ${l.fontSize}px "${l.fontFamily}"`)
  )
  await Promise.all(promises)
}

function drawTextLayers(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  layers: TextLayer[],
  t: number,
  totalDuration: number,
  canvasW: number,
  canvasH: number,
) {
  for (const layer of layers) {
    const state = getTextLayerState(layer, t, totalDuration)
    if (!state.visible || state.opacity <= 0) continue

    const x = (layer.x / 100) * canvasW
    const y = (layer.y / 100) * canvasH
    const maxW = (layer.width / 100) * canvasW

    ctx.save()
    ctx.globalAlpha = state.opacity
    ctx.font = `${layer.fontStyle} ${layer.fontWeight} ${layer.fontSize}px "${layer.fontFamily}", sans-serif`
    ctx.fillStyle = layer.color
    ctx.textAlign = layer.align
    ctx.textBaseline = 'middle'
    // @ts-expect-error — letterSpacing is Chrome 94+ / Safari 17+
    ctx.letterSpacing = `${layer.letterSpacing}em`

    const lineH = layer.fontSize * layer.lineHeight
    const lines = layer.text.split('\n').flatMap(para => wrapText(ctx, para, maxW))
    const totalH = lines.length * lineH
    const startY = y - totalH / 2

    // Typewriter clip
    if (state.clipPath && state.clipPath !== 'none') {
      const match = state.clipPath.match(/inset\(0 ([\d.]+)% 0 0\)/)
      if (match) {
        const rightClip = parseFloat(match[1]) / 100
        const clipX = layer.align === 'center' ? x - maxW / 2
                    : layer.align === 'right'  ? x - maxW
                    : x
        ctx.rect(clipX, startY - lineH, maxW * (1 - rightClip), totalH + lineH * 2)
        ctx.clip()
      }
    }

    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + (i + 0.5) * lineH)
    })

    ctx.restore()
  }
}

// ── Main export function ──────────────────────────────────────────────────────

export async function exportAnimationMp4(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  template: AnimTemplate,
  textLayers: TextLayer[],
  onProgress: (current: number, total: number) => void,
): Promise<Blob> {
  const fps = 30
  const totalDuration = template.keyframes.reduce((s, kf) => s + kf.duration, 0)
  const totalFrames   = Math.ceil(totalDuration * fps)

  // Ensure even dimensions (H.264 requirement)
  const width  = gl.domElement.width  % 2 === 0 ? gl.domElement.width  : gl.domElement.width  - 1
  const height = gl.domElement.height % 2 === 0 ? gl.domElement.height : gl.domElement.height - 1

  // Pre-load all fonts used by text layers
  if (textLayers.length > 0) await ensureFontsLoaded(textLayers)

  const target = new ArrayBufferTarget()
  const muxer  = new Muxer({
    target,
    video: { codec: 'avc', width, height, frameRate: fps },
    fastStart: 'in-memory',
  })

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? undefined),
    error: (e) => console.error('VideoEncoder error:', e),
  })
  encoder.configure({ codec: 'avc1.42001f', width, height, bitrate: 8_000_000, framerate: fps })

  // Composite canvas — blends WebGL frame + text overlays
  const composite = new OffscreenCanvas(width, height)
  const ctx = composite.getContext('2d')!

  const wasPaused = animClock.paused
  animClock.paused = true

  try {
    for (let i = 0; i < totalFrames; i++) {
      const t = i / fps
      setCameraAtTime(camera, template, t)
      gl.render(scene, camera)

      // Blit WebGL frame
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(gl.domElement, 0, 0, width, height)

      // Draw text layers on top
      if (textLayers.length > 0) {
        drawTextLayers(ctx, textLayers, t, totalDuration, width, height)
      }

      const frame = new VideoFrame(composite, {
        timestamp: Math.round(t * 1_000_000),
        duration:  Math.round(1_000_000 / fps),
      })
      encoder.encode(frame, { keyFrame: i % fps === 0 })
      frame.close()

      onProgress(i + 1, totalFrames)
      if (i % 10 === 9) await new Promise<void>((r) => setTimeout(r, 0))
    }

    await encoder.flush()
    muxer.finalize()
    return new Blob([target.buffer], { type: 'video/mp4' })
  } finally {
    animClock.paused = wasPaused
  }
}

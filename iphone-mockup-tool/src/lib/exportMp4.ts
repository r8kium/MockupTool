import * as THREE from 'three'
import { Muxer, ArrayBufferTarget } from 'mp4-muxer'
import type { AnimTemplate } from '@/types'
import { animClock } from './animClock'
import { evalBezier } from './utils'

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

export async function exportAnimationMp4(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  template: AnimTemplate,
  onProgress: (current: number, total: number) => void,
): Promise<Blob> {
  const fps = 30
  const totalDuration = template.keyframes.reduce((s, kf) => s + kf.duration, 0)
  const totalFrames = Math.ceil(totalDuration * fps)

  // Ensure even dimensions (H.264 requirement)
  const width  = gl.domElement.width  % 2 === 0 ? gl.domElement.width  : gl.domElement.width  - 1
  const height = gl.domElement.height % 2 === 0 ? gl.domElement.height : gl.domElement.height - 1

  const target = new ArrayBufferTarget()
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height, frameRate: fps },
    fastStart: 'in-memory',
  })

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? undefined),
    error: (e) => console.error('VideoEncoder error:', e),
  })

  encoder.configure({
    codec: 'avc1.42001f',
    width,
    height,
    bitrate: 8_000_000,
    framerate: fps,
  })

  const wasPaused = animClock.paused
  animClock.paused = true

  try {
    for (let i = 0; i < totalFrames; i++) {
      const t = i / fps
      setCameraAtTime(camera, template, t)
      gl.render(scene, camera)

      const frame = new VideoFrame(gl.domElement, {
        timestamp: Math.round(t * 1_000_000),
        duration: Math.round(1_000_000 / fps),
      })
      encoder.encode(frame, { keyFrame: i % fps === 0 })
      frame.close()

      onProgress(i + 1, totalFrames)

      // Yield every 10 frames to keep UI responsive
      if (i % 10 === 9) await new Promise<void>((r) => setTimeout(r, 0))
    }

    await encoder.flush()
    muxer.finalize()

    return new Blob([target.buffer], { type: 'video/mp4' })
  } finally {
    animClock.paused = wasPaused
  }
}

export interface CameraKF {
  t: number
  pos: [number, number, number]
  look: [number, number, number]
}

export interface DeviceKF {
  t: number
  rot: [number, number, number]   // euler degrees [x, y, z]
  pos?: [number, number, number]  // optional translation
}

export interface BgPlane {
  pos: [number, number, number]
  rot: [number, number, number]   // euler degrees
  size: [number, number]
  color: string
}

export interface Scene {
  id: string
  name: string
  duration: number
  bgDecoration?: BgPlane[]
  cameraPath: CameraKF[]
  devicePath: DeviceKF[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function lerpV3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

function findSegment<T extends { t: number }>(path: T[], t: number): [T, T, number] {
  for (let i = 0; i < path.length - 1; i++) {
    if (t >= path[i].t && t <= path[i + 1].t) {
      const alpha = (t - path[i].t) / (path[i + 1].t - path[i].t)
      return [path[i], path[i + 1], alpha]
    }
  }
  return [path[path.length - 1], path[path.length - 1], 0]
}

export function interpolateCam(
  path: CameraKF[],
  t: number,
): { pos: [number, number, number]; look: [number, number, number] } {
  if (!path.length) return { pos: [0, 0, 18], look: [0, 0, 0] }
  if (t <= path[0].t) return path[0]
  if (t >= path[path.length - 1].t) return path[path.length - 1]
  const [a, b, alpha] = findSegment(path, t)
  return { pos: lerpV3(a.pos, b.pos, alpha), look: lerpV3(a.look, b.look, alpha) }
}

export function interpolateDevice(
  path: DeviceKF[],
  t: number,
): { rot: [number, number, number]; pos: [number, number, number] } {
  const zero: [number, number, number] = [0, 0, 0]
  if (!path.length) return { rot: zero, pos: zero }
  if (t <= path[0].t) return { rot: path[0].rot, pos: path[0].pos ?? zero }
  if (t >= path[path.length - 1].t) {
    const last = path[path.length - 1]
    return { rot: last.rot, pos: last.pos ?? zero }
  }
  const [a, b, alpha] = findSegment(path, t)
  return {
    rot: lerpV3(a.rot, b.rot, alpha),
    pos: lerpV3(a.pos ?? zero, b.pos ?? zero, alpha),
  }
}

// ── Background geometry presets ────────────────────────────────────────────────
const CLASSIC_BG: BgPlane[] = [
  { pos: [0, -7, -4],   rot: [-90, 0, 0],  size: [70, 70], color: '#e8e8e8' },
  { pos: [-12, 5, -9],  rot: [0, 42, 0],   size: [30, 26], color: '#f0f0f0' },
  { pos: [12, 5, -9],   rot: [0, -42, 0],  size: [30, 26], color: '#ebebeb' },
]

const SHELF_BG: BgPlane[] = [
  { pos: [0, -7, -4],   rot: [-90, 0, 0],  size: [70, 70], color: '#1a1a1a' },
  { pos: [0, 8, -12],   rot: [0, 0, 0],    size: [70, 35], color: '#111111' },
]

const STUDIO_BG: BgPlane[] = [
  { pos: [0, -7, -4],   rot: [-90, 0, 0],  size: [70, 70], color: '#f5f5f5' },
  { pos: [0, 12, -12],  rot: [0, 0, 0],    size: [70, 40], color: '#f5f5f5' },
]

// ── Scene definitions ──────────────────────────────────────────────────────────
export const SCENES: Scene[] = [
  // 1. Classic
  {
    id: 'classic',
    name: 'Classic',
    duration: 4,
    bgDecoration: CLASSIC_BG,
    cameraPath: [
      { t: 0,   pos: [14, 10, 13], look: [0, 0, 0] },
      { t: 0.35,pos: [10, 6,  15], look: [0, 0, 0] },
      { t: 0.7, pos: [5,  4,  17], look: [0, 0, 0] },
      { t: 1,   pos: [1,  2,  18], look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [5, -30, 0] },
      { t: 1, rot: [5, 20,  0] },
    ],
  },

  // 2. Dark Drama — aerial drop to front
  {
    id: 'dark-drama',
    name: 'Dark Drama',
    duration: 4,
    bgDecoration: SHELF_BG,
    cameraPath: [
      { t: 0,   pos: [0,  20, 6],  look: [0, 0, 0] },
      { t: 0.45,pos: [6,  12, 12], look: [0, 0, 0] },
      { t: 1,   pos: [3,  2,  18], look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [-20, -10, 0] },
      { t: 1, rot: [0,    10, 0] },
    ],
  },

  // 3. Bold — close dramatic shot
  {
    id: 'bold',
    name: 'Bold',
    duration: 3,
    cameraPath: [
      { t: 0,   pos: [8, 6, 12],  look: [0, 0, 0] },
      { t: 0.5, pos: [5, 4, 14],  look: [0, 0, 0] },
      { t: 1,   pos: [0, 1, 18],  look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [-8, -10, 3] },
      { t: 1, rot: [-3,  10, 0] },
    ],
  },

  // 4. Full Spin — 360° device rotation
  {
    id: 'spin',
    name: 'Full Spin',
    duration: 5,
    bgDecoration: STUDIO_BG,
    cameraPath: [
      { t: 0, pos: [0, 3, 18], look: [0, 0, 0] },
      { t: 1, pos: [0, 3, 18], look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0,    rot: [0, 0,   0] },
      { t: 0.25, rot: [0, 90,  0] },
      { t: 0.5,  rot: [0, 180, 0] },
      { t: 0.75, rot: [0, 270, 0] },
      { t: 1,    rot: [0, 360, 0] },
    ],
  },

  // 5. Flat Lay — top-down
  {
    id: 'flat-lay',
    name: 'Flat Lay',
    duration: 4,
    bgDecoration: STUDIO_BG,
    cameraPath: [
      { t: 0,   pos: [0, 20, 3],  look: [0, 0, 0] },
      { t: 0.5, pos: [5, 18, 6],  look: [0, 0, 0] },
      { t: 1,   pos: [8, 15, 10], look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [-88, 0,  0] },
      { t: 1, rot: [-88, 10, 0] },
    ],
  },

  // 6. Side Sweep — sweeps from side to front
  {
    id: 'side-sweep',
    name: 'Side Sweep',
    duration: 4,
    cameraPath: [
      { t: 0,   pos: [18, 3, 2],  look: [0, 0, 0] },
      { t: 0.35,pos: [14, 4, 9],  look: [0, 0, 0] },
      { t: 0.7, pos: [7,  3, 15], look: [0, 0, 0] },
      { t: 1,   pos: [0,  1, 18], look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [0, 65, 0] },
      { t: 1, rot: [0, 0,  0] },
    ],
  },

  // 7. Minimal — slow gentle reveal
  {
    id: 'minimal',
    name: 'Minimal',
    duration: 5,
    bgDecoration: STUDIO_BG,
    cameraPath: [
      { t: 0, pos: [0, 0, 18], look: [0, 0, 0] },
      { t: 1, pos: [5, 2, 17], look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [0, 0, 0] },
      { t: 1, rot: [0, 8, 0] },
    ],
  },

  // 8. Orbit — camera orbits the device
  {
    id: 'orbit',
    name: 'Orbit',
    duration: 6,
    cameraPath: [
      { t: 0,    pos: [0,  4,  18],  look: [0, 0, 0] },
      { t: 0.25, pos: [18, 4,  0],   look: [0, 0, 0] },
      { t: 0.5,  pos: [0,  4, -18],  look: [0, 0, 0] },
      { t: 0.75, pos: [-18,4,  0],   look: [0, 0, 0] },
      { t: 1,    pos: [0,  4,  18],  look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [0, 0, 0] },
      { t: 1, rot: [0, 0, 0] },
    ],
  },

  // 9. Tilt Reveal — phone tilts from horizontal to upright
  {
    id: 'tilt-reveal',
    name: 'Tilt Reveal',
    duration: 4,
    cameraPath: [
      { t: 0,   pos: [6, 10, 16], look: [0, 0, 0] },
      { t: 0.5, pos: [4, 6,  17], look: [0, 0, 0] },
      { t: 1,   pos: [3, 2,  18], look: [0, 0, 0] },
    ],
    devicePath: [
      { t: 0,   rot: [-70, 0, 0] },
      { t: 0.6, rot: [-20, 0, 0] },
      { t: 1,   rot: [0,   0, 0] },
    ],
  },

  // 10. Float — device floats up from below
  {
    id: 'float',
    name: 'Float',
    duration: 4,
    cameraPath: [
      { t: 0,   pos: [6, 2, 18], look: [0, -4, 0] },
      { t: 0.5, pos: [4, 3, 18], look: [0, -2, 0] },
      { t: 1,   pos: [3, 4, 17], look: [0,  0, 0] },
    ],
    devicePath: [
      { t: 0, rot: [0, -15, 0], pos: [0, -6, 0] },
      { t: 1, rot: [0,  10, 0], pos: [0,  0, 0] },
    ],
  },
]

export const SCENE_MAP: Record<string, Scene> = Object.fromEntries(SCENES.map((s) => [s.id, s]))

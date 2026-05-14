import type { SceneTemplate } from '@/types'

export const SCENE_TEMPLATES: SceneTemplate[] = [
  // ── Hand-crafted templates ────────────────────────────────────────────────────
  {
    id: 'phone-x2',
    name: 'Two Phones',
    thumbnailPath: '/thumbnails/scene-phone-x2.png',
    camPresets: {
      front:     [0,  0, 18] as [number,number,number],
      isometric: [6,  3, 15] as [number,number,number],
      side:      [18, 2,  8] as [number,number,number],
    },
    slots: [
      { deviceId: 'iphone-16-pro', position: [-3.5, 0, 0], rotation: [0, 12, 0],  label: 'Left Phone'  },
      { deviceId: 'iphone-16-pro', position: [ 3.5, 0, 0], rotation: [0,-12, 0],  label: 'Right Phone' },
    ],
  },
  {
    id: 'phone-on-macbook',
    name: 'Phone on MacBook',
    thumbnailPath: '/thumbnails/scene-phone-macbook.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [0, 0, 0],       rotation: [0,  0, 0],  label: 'MacBook' },
      { deviceId: 'iphone-16-pro',     position: [4, 0.5, 4.5],   rotation: [0, 12, 0],  scaleMul: 0.35, label: 'iPhone' },
    ],
  },
  {
    id: 'phone-beside-macbook',
    name: 'Phone + MacBook',
    thumbnailPath: '/thumbnails/scene-phone-beside-macbook.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2, 0, 0], rotation: [0,  8, 0],  label: 'MacBook' },
      { deviceId: 'iphone-16-pro',     position: [ 7, 0, 3], rotation: [0,-10, 0],  scaleMul: 0.35, label: 'iPhone' },
    ],
  },
  {
    id: 'phone-macbook-watch',
    name: 'Phone + Mac + Watch',
    thumbnailPath: '/thumbnails/scene-family.png',
    camPresets: {
      front:     [0,  2, 24] as [number,number,number],
      isometric: [10, 5, 20] as [number,number,number],
      side:      [22, 3, 12] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2,  0,   0  ], rotation: [0,  8, 0],  label: 'MacBook' },
      { deviceId: 'iphone-16-pro',     position: [ 7,  0,   3  ], rotation: [0,-10, 0],  scaleMul: 0.35, label: 'iPhone'  },
      { deviceId: 'watch-ultra-2',     position: [ 9, -1.5, 4.5], rotation: [0,-15, 0],  scaleMul: 0.18, label: 'Watch'   },
    ],
  },
  {
    id: 'macbook-ipad',
    name: 'MacBook + iPad',
    thumbnailPath: '/thumbnails/scene-macbook-ipad.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-3, 0, 0], rotation: [0,  8, 0],  label: 'MacBook' },
      { deviceId: 'ipad-mini-6',       position: [ 7, 0, 3], rotation: [0,-15, 0],  scaleMul: 0.55, label: 'iPad' },
    ],
  },

  // ── Additional compositions ───────────────────────────────────────────────────
  {
    id: 'iphone-12-double',
    name: 'iPhone 12 Pro Double',
    thumbnailPath: '/thumbnails/scenes/iphone-double.png',
    camPresets: {
      front:     [0,  0, 18] as [number,number,number],
      isometric: [6,  3, 15] as [number,number,number],
      side:      [18, 2,  8] as [number,number,number],
    },
    slots: [
      { deviceId: 'iphone-12-pro', position: [0,  -0.94,  1.34], rotation: [0, 180, 0], label: 'Front Phone' },
      { deviceId: 'iphone-12-pro', position: [0,   0.94, -1.34], rotation: [0,   0, 0], label: 'Back Phone'  },
    ],
  },
  {
    id: 'iphone-12-triple',
    name: 'iPhone 12 Pro Triple',
    thumbnailPath: '/thumbnails/scenes/iphone-triple.png',
    camPresets: {
      front:     [0,  0, 22] as [number,number,number],
      isometric: [8,  4, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'iphone-12-pro', position: [-2.75,  2.42,  0.41], rotation: [0, 270, 0], label: 'Side Phone'   },
      { deviceId: 'iphone-12-pro', position: [ 1.37, -2.15,  1.14], rotation: [0, 180, 0], label: 'Front Phone'  },
      { deviceId: 'iphone-12-pro', position: [ 1.37, -0.27, -1.54], rotation: [0,   0, 0], label: 'Back Phone'   },
    ],
  },
  {
    id: 'cleanphone-x2',
    name: 'CleanPhone × 2',
    thumbnailPath: '/thumbnails/scenes/cleanphone-x2.png',
    camPresets: {
      front:     [0,  0, 20] as [number,number,number],
      isometric: [6,  4, 17] as [number,number,number],
      side:      [18, 2,  8] as [number,number,number],
    },
    slots: [
      { deviceId: 'clean-phone', position: [ 2.81,  2.63, 0], rotation: [0, 0, 180], label: 'Top Phone'    },
      { deviceId: 'clean-phone', position: [-2.81, -2.63, 0], rotation: [0, 0,   0], label: 'Bottom Phone' },
    ],
  },
  {
    id: 'family-phone-on-macbook',
    name: 'iPhone on MacBook (Leaning)',
    thumbnailPath: '/thumbnails/scenes/family-phone-on-macbook.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [0, 0, 0],      rotation: [0, 0, 0],        label: 'MacBook' },
      { deviceId: 'iphone-12-pro',     position: [3, 0.5, 4],    rotation: [0, 195, -32],    scaleMul: 0.35, label: 'iPhone' },
    ],
  },
  {
    id: 'family-iphone-down',
    name: 'iPhone Down + MacBook',
    thumbnailPath: '/thumbnails/scenes/family-iphone-down.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2, 0, 0],    rotation: [0, 5, 0],        label: 'MacBook' },
      { deviceId: 'iphone-12-pro',     position: [ 7, -1, 3],   rotation: [-90, 180, 0],    scaleMul: 0.35, label: 'iPhone (Flat)' },
    ],
  },
  {
    id: 'family-iphone-float',
    name: 'iPhone Floating + MacBook',
    thumbnailPath: '/thumbnails/scenes/family-iphone-float.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2, 0, 0],    rotation: [0, 5, 0],        label: 'MacBook' },
      { deviceId: 'iphone-12-pro',     position: [ 7, 2, 3],    rotation: [-25, 191, 9],    scaleMul: 0.35, label: 'iPhone (Floating)' },
    ],
  },
  {
    id: 'family-iphone-out',
    name: 'iPhone Out + MacBook',
    thumbnailPath: '/thumbnails/scenes/family-iphone-out.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2, 0, 0],    rotation: [0, 5, 0],    label: 'MacBook' },
      { deviceId: 'iphone-12-pro',     position: [ 7, 0, 3],    rotation: [0, 270, 0],  scaleMul: 0.35, label: 'iPhone (Side)' },
    ],
  },
  {
    id: 'family-iphone-up',
    name: 'iPhone Standing + MacBook',
    thumbnailPath: '/thumbnails/scenes/family-iphone-up.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2, 0, 0],    rotation: [0, 5, 0],    label: 'MacBook' },
      { deviceId: 'iphone-12-pro',     position: [ 7, 0, 2],    rotation: [0, 180, 0],  scaleMul: 0.35, label: 'iPhone (Standing)' },
    ],
  },
  {
    id: 'family-iphone-up45',
    name: 'iPhone 45° + MacBook',
    thumbnailPath: '/thumbnails/scenes/family-iphone-up45.png',
    camPresets: {
      front:     [0,  2, 22] as [number,number,number],
      isometric: [8,  5, 18] as [number,number,number],
      side:      [20, 3, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2, 0, 0],    rotation: [0, 5, 0],       label: 'MacBook' },
      { deviceId: 'iphone-12-pro',     position: [ 7, -0.5, 3], rotation: [-45, 195, 0],   scaleMul: 0.35, label: 'iPhone (45°)' },
    ],
  },
  {
    id: 'apple-device-family',
    name: 'Apple Device Family',
    thumbnailPath: '/thumbnails/scenes/apple-device-family.png',
    camPresets: {
      front:     [0,  2, 26] as [number,number,number],
      isometric: [10, 5, 22] as [number,number,number],
      side:      [24, 3, 13] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-14', position: [-4.0,  0.0,  0.0], rotation: [0,  5, 0], scaleMul: 1.0,  label: 'MacBook Pro' },
      { deviceId: 'ipad-m1-2021',      position: [ 2.86, 4.23, -4.1], rotation: [0, -8, 0], scaleMul: 0.65, label: 'iPad' },
      { deviceId: 'iphone-16-pro',     position: [ 6.34, 2.09, -3.66], rotation: [0,-12, 0], scaleMul: 0.45, label: 'iPhone' },
      { deviceId: 'watch-series-7',    position: [ 5.19, 0.59, -1.83], rotation: [0,-15, 0], scaleMul: 0.12, label: 'Watch' },
    ],
  },
]

export const COMPOSITION_MAP: Record<string, SceneTemplate> = Object.fromEntries(
  SCENE_TEMPLATES.map((s) => [s.id, s])
)

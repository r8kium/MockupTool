import type { SceneTemplate } from '@/types'

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'phone-x2',
    name: 'Two Phones',
    thumbnailPath: '/thumbnails/scene-phone-x2.png',
    camPresets: {
      front:     [0,  0, 22] as [number,number,number],
      isometric: [8,  4, 19] as [number,number,number],
      side:      [22, 2, 10] as [number,number,number],
    },
    slots: [
      { deviceId: 'iphone-16-pro', position: [-4.5, 0, 0], rotation: [0, 12, 0],  label: 'Left Phone'  },
      { deviceId: 'iphone-16-pro', position: [ 4.5, 0, 0], rotation: [0,-12, 0],  label: 'Right Phone' },
    ],
  },
  {
    id: 'phone-on-macbook',
    name: 'Phone on MacBook',
    thumbnailPath: '/thumbnails/scene-phone-macbook.png',
    camPresets: {
      front:     [0,  2, 26] as [number,number,number],
      isometric: [10, 6, 21] as [number,number,number],
      side:      [24, 4, 11] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [0, 0, 0],         rotation: [0,  0, 0], label: 'MacBook' },
      { deviceId: 'iphone-16-pro',     position: [1, -0.5, 5.5],    rotation: [0, 12, 0], scaleMul: 0.85, label: 'iPhone' },
    ],
  },
  {
    id: 'phone-beside-macbook',
    name: 'Phone + MacBook',
    thumbnailPath: '/thumbnails/scene-phone-beside-macbook.png',
    camPresets: {
      front:     [0,  2, 28] as [number,number,number],
      isometric: [12, 6, 22] as [number,number,number],
      side:      [26, 4, 12] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-3.5, 0, 0], rotation: [0,  8, 0], label: 'MacBook' },
      { deviceId: 'iphone-16-pro',     position: [ 8.5, 0, 4], rotation: [0,-10, 0], scaleMul: 0.9, label: 'iPhone' },
    ],
  },
  {
    id: 'phone-macbook-watch',
    name: 'Phone + Mac + Watch',
    thumbnailPath: '/thumbnails/scene-family.png',
    camPresets: {
      front:     [0,  2, 30] as [number,number,number],
      isometric: [12, 6, 25] as [number,number,number],
      side:      [28, 4, 13] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-2,   0,    0  ], rotation: [0,  8, 0], label: 'MacBook' },
      { deviceId: 'iphone-16-pro',     position: [ 8,   0,    4  ], rotation: [0,-10, 0], scaleMul: 0.9, label: 'iPhone'  },
      { deviceId: 'watch-ultra-2',     position: [12.5,-1.5,  5.5], rotation: [0,-15, 0], label: 'Watch'   },
    ],
  },
  {
    id: 'macbook-ipad',
    name: 'MacBook + iPad',
    thumbnailPath: '/thumbnails/scene-macbook-ipad.png',
    camPresets: {
      front:     [0,  2, 28] as [number,number,number],
      isometric: [12, 6, 22] as [number,number,number],
      side:      [26, 4, 12] as [number,number,number],
    },
    slots: [
      { deviceId: 'macbook-pro-m3-16', position: [-4, 0, 0], rotation: [0,  8, 0], label: 'MacBook' },
      { deviceId: 'ipad-mini-6',       position: [ 7, 0, 3], rotation: [0,-15, 0], scaleMul: 0.9, label: 'iPad' },
    ],
  },
]

export const COMPOSITION_MAP: Record<string, SceneTemplate> = Object.fromEntries(
  SCENE_TEMPLATES.map((s) => [s.id, s])
)

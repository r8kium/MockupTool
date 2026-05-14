import type { AnimTemplate } from '@/types'

// ── 16 camera animation templates ────────────────────────────────────────────
//
// 5 hand-crafted (no MP4 — thumbnail uses CSS animation on device image)
// 11 extracted from Rotato .keyframes files (MP4 previews from app bundle)
//
// duration = seconds to transition FROM this keyframe TO the next (loops).


export const ANIM_TEMPLATES: AnimTemplate[] = [
  // ── Hand-crafted: gentle / ambient ───────────────────────────────────────
  {
    id: 'float',
    name: 'Float',
    keyframes: [
      { cam: [0, -0.5, 18], roll:  0, duration: 2.5, easing: [0.42, 0.0, 0.58, 1.0] },
      { cam: [0,  0.5, 18], roll:  0, duration: 2.5, easing: [0.42, 0.0, 0.58, 1.0] },
    ],
  },
  {
    id: 'tilt',
    name: 'Tilt',
    keyframes: [
      { cam: [0, 1, 18], roll: -14, duration: 3.0, easing: [0.42, 0.0, 0.58, 1.0] },
      { cam: [0, 1, 18], roll:  14, duration: 3.0, easing: [0.42, 0.0, 0.58, 1.0] },
    ],
  },

  // ── Hand-crafted: cinematic camera moves ─────────────────────────────────
  {
    id: 'dolly-in',
    name: 'Dolly In',
    keyframes: [
      { cam: [0, 2, 26], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0, 1, 11], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'dolly-out',
    name: 'Dolly Out',
    keyframes: [
      { cam: [0, 1, 11], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0, 2, 26], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'orbit',
    name: 'Orbit',
    keyframes: [
      { cam: [  0, 3,  18], roll: 0, duration: 4.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 18, 3,   0], roll: 0, duration: 4.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [  0, 3, -18], roll: 0, duration: 4.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [-18, 3,   0], roll: 0, duration: 4.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },

  // ── Rotato originals (with MP4 previews) ─────────────────────────────────
  {
    id: '01-topturn',
    name: 'Top Turn',
    previewPath: '/templates/01-topturn.mp4',
    keyframes: [
      { cam: [-1.16, 5.52, 5.20], roll: -32.3, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 0.27, 5.52, 5.20], roll:  19.3, duration: 1.5, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '02-bottom-turn',
    name: 'Bottom Turn',
    previewPath: '/templates/02-bottom-turn.mp4',
    keyframes: [
      { cam: [-1.90, 3.67, 7.42], roll:  19.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [-0.18, 3.83, 7.30], roll: -16.2, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '03-flip-in',
    name: 'Flip In',
    previewPath: '/templates/03-flip-in.mp4',
    keyframes: [
      { cam: [ 5.97, 0.00, -7.30], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 9.00, 0.00, 16.44], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '04-flip-up',
    name: 'Flip Up',
    previewPath: '/templates/04-flip-up.mp4',
    keyframes: [
      { cam: [ 9.77,  5.10, -4.01], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [-7.69, -2.53,  7.23], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '05-pan-across',
    name: 'Pan Across',
    previewPath: '/templates/05-pan-across.mp4',
    keyframes: [
      { cam: [-8.64, 6.20, 13.76], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 9.42, 6.20, 13.76], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '06-hover',
    name: 'Hover',
    previewPath: '/templates/06-hover.mp4',
    keyframes: [
      { cam: [0.00, 10.19, 8.04], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
      { cam: [0.00,  9.18, 8.04], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
      { cam: [0.00, 10.19, 8.04], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
    ],
  },
  {
    id: '08-slide-in',
    name: 'Slide In',
    previewPath: '/templates/08-slide-in.mp4',
    keyframes: [
      { cam: [-3.14, 3.92,  8.22], roll: 0.4, duration: 3.0, easing: [0.44, 0.05, 0.55, 0.95] },
      { cam: [ 0.00, 0.00, 17.99], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.00] },
    ],
  },
  {
    id: '09-dangle',
    name: 'Dangle',
    previewPath: '/templates/09-dangle.mp4',
    keyframes: [
      { cam: [ 0.00, -2.86, 9.59], roll: 25.1, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [-1.39,  1.21, 8.90], roll: 12.5, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '10-hoist-down',
    name: 'Hoist Down',
    previewPath: '/templates/10-hoist-down.mp4',
    keyframes: [
      { cam: [-2.39, -2.17, 10.43], roll:  0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [12.80,  1.35, 15.09], roll: 14.3, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '11-edging',
    name: 'Edging',
    previewPath: '/templates/11-edging.mp4',
    keyframes: [
      { cam: [-3.05,  2.71, 8.70], roll: -3.6, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 3.04, -3.01, 9.82], roll:  5.1, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: '12-slide-in',
    name: 'Slide In (Top)',
    previewPath: '/templates/12-slide-in.mp4',
    keyframes: [
      { cam: [0.31,  7.18,  4.96], roll: -5.2, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0.08,  8.92, 12.51], roll: 12.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
]

export const ANIM_TEMPLATE_MAP: Record<string, AnimTemplate> = Object.fromEntries(
  ANIM_TEMPLATES.map((t) => [t.id, t])
)

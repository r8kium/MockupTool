import type { AnimTemplate } from '@/types'

// Safe minimum camera distance: 14 units (phone is ~10 units tall, FOV 45°,
// so frustum half-height at dist 14 ≈ 5.8 > 5 = half the device height).
// Templates with large roll use 15–16 to account for diagonal extent.
// duration = seconds to transition FROM this keyframe TO the next (loops).

export const ANIM_TEMPLATES: AnimTemplate[] = [
  // ── Ambient ──────────────────────────────────────────────────────────────────
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

  // ── Cinematic ────────────────────────────────────────────────────────────────
  {
    id: 'dolly-in',
    name: 'Dolly In',
    keyframes: [
      { cam: [0, 2, 24], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0, 1, 14], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'dolly-out',
    name: 'Dolly Out',
    keyframes: [
      { cam: [0, 1, 14], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0, 2, 24], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
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

  // ── Studio ───────────────────────────────────────────────────────────────────
  {
    id: 'top-turn',
    name: 'Top Turn',
    keyframes: [
      { cam: [-2.1, 10.1, 9.5], roll: -32.3, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 0.5, 10.2, 9.6], roll:  19.3, duration: 1.5, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'bottom-turn',
    name: 'Bottom Turn',
    keyframes: [
      { cam: [-3.1, 6.1, 12.2], roll:  19.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [-0.3, 6.5, 12.4], roll: -16.2, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'flip-in',
    name: 'Flip In',
    keyframes: [
      { cam: [14.0, 0.0,  5.0], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 0.0, 0.0, 17.0], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'flip-up',
    name: 'Flip Up',
    keyframes: [
      { cam: [ 8.0, -6.0, 10.0], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [-8.0,  5.0, 10.0], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'pan-across',
    name: 'Pan Across',
    keyframes: [
      { cam: [-8.64, 6.20, 13.76], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 9.42, 6.20, 13.76], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'hover',
    name: 'Hover',
    keyframes: [
      { cam: [0.0, 12.6,  9.9], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
      { cam: [0.0, 12.0, 10.6], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
      { cam: [0.0, 12.6,  9.9], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
    ],
  },
  {
    id: 'slide-in',
    name: 'Slide In',
    keyframes: [
      { cam: [-4.6, 5.7, 12.0], roll: 0.4, duration: 3.0, easing: [0.44, 0.05, 0.55, 0.95] },
      { cam: [ 0.0, 0.0, 18.0], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.00] },
    ],
  },
  {
    id: 'dangle',
    name: 'Dangle',
    keyframes: [
      { cam: [ 0.0, -4.3, 14.4], roll: 25.1, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [-2.3,  2.0, 14.7], roll: 12.5, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'hoist-down',
    name: 'Hoist Down',
    keyframes: [
      { cam: [-3.1, -2.8, 13.4], roll:  0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 8.5,  1.4, 15.0], roll: 14.3, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'edging',
    name: 'Edging',
    keyframes: [
      { cam: [-4.4,  3.9, 12.7], roll: -3.6, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 4.0, -3.9, 12.8], roll:  5.1, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
  {
    id: 'slide-in-top',
    name: 'Slide In (Top)',
    keyframes: [
      { cam: [0.5, 11.5,  8.0], roll: -5.2, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0.1,  8.9, 12.5], roll: 12.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },
]

export const ANIM_TEMPLATE_MAP: Record<string, AnimTemplate> = Object.fromEntries(
  ANIM_TEMPLATES.map((t) => [t.id, t])
)

import type { AnimTemplate } from '@/types'

// ── 10 curated camera animation templates ────────────────────────────────────
//
// 5 extracted from Rotato .keyframes files (with MP4 previews)
// 5 hand-crafted to fill industry-standard gaps (no preview video)
//
// All positions are in Three.js scene units (camera looks at origin).
// duration = seconds to transition FROM this keyframe TO the next (loops).

export const ANIM_TEMPLATES: AnimTemplate[] = [
  // ── Gentle / ambient ─────────────────────────────────────────────────────

  {
    id: 'float',
    name: 'Float',
    // Subtle vertical bob from straight-front. Most common effect on product landing pages.
    keyframes: [
      { cam: [0, -0.5, 18], roll:  0, duration: 2.5, easing: [0.42, 0.0, 0.58, 1.0] },
      { cam: [0,  0.5, 18], roll:  0, duration: 2.5, easing: [0.42, 0.0, 0.58, 1.0] },
    ],
  },

  {
    id: 'tilt',
    name: 'Tilt',
    // Camera gently rocks left/right with subtle roll — popular in App Store screenshots.
    keyframes: [
      { cam: [0, 1, 18], roll: -14, duration: 3.0, easing: [0.42, 0.0, 0.58, 1.0] },
      { cam: [0, 1, 18], roll:  14, duration: 3.0, easing: [0.42, 0.0, 0.58, 1.0] },
    ],
  },

  // ── Cinematic camera moves ────────────────────────────────────────────────

  {
    id: 'dolly-in',
    name: 'Dolly In',
    // Camera pushes straight in toward device — classic cinematic emphasis move.
    keyframes: [
      { cam: [0, 2, 26], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0, 1, 11], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },

  {
    id: 'dolly-out',
    name: 'Dolly Out',
    // Camera pulls back to reveal — hero/reveal shot staple.
    keyframes: [
      { cam: [0, 1, 11], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [0, 2, 26], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },

  {
    id: 'orbit',
    name: 'Orbit',
    // Full circular arc — front → right → back → left → front.
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
    // Camera slightly pans and rolls from -32° to +19° — cinematic tilt effect.
    keyframes: [
      { cam: [-1.16, 5.52, 5.20], roll: -32.3, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 0.27, 5.52, 5.20], roll:  19.3, duration: 1.5, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },

  {
    id: '06-hover',
    name: 'Hover',
    previewPath: '/templates/06-hover.mp4',
    // Dramatic 41° tilt with subtle vertical bob — "showcase" angle.
    keyframes: [
      { cam: [0.00, 10.19, 8.04], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
      { cam: [0.00,  9.18, 8.04], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
      { cam: [0.00, 10.19, 8.04], roll: -40.8, duration: 3.0, easing: [0.42, 0.00, 0.58, 1.0] },
    ],
  },

  {
    id: '05-pan-across',
    name: 'Pan Across',
    previewPath: '/templates/05-pan-across.mp4',
    // Camera sweeps left to right — standard horizontal product reveal.
    keyframes: [
      { cam: [-8.64, 6.20, 13.76], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 9.42, 6.20, 13.76], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },

  {
    id: '03-flip-in',
    name: 'Flip In',
    previewPath: '/templates/03-flip-in.mp4',
    // Camera sweeps from behind device to front — dynamic reveal.
    keyframes: [
      { cam: [ 5.97, 0.00, -7.30], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
      { cam: [ 9.00, 0.00, 16.44], roll: 0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.0] },
    ],
  },

  {
    id: '08-slide-in',
    name: 'Slide In',
    previewPath: '/templates/08-slide-in.mp4',
    // Camera starts close and angled, glides out to straight front.
    keyframes: [
      { cam: [-3.14, 3.92,  8.22], roll: 0.4, duration: 3.0, easing: [0.44, 0.05, 0.55, 0.95] },
      { cam: [ 0.00, 0.00, 17.99], roll: 0.0, duration: 3.0, easing: [0.25, 0.10, 0.25, 1.00] },
    ],
  },
]

export const ANIM_TEMPLATE_MAP: Record<string, AnimTemplate> = Object.fromEntries(
  ANIM_TEMPLATES.map((t) => [t.id, t])
)

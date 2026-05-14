export interface BlobConfig {
  color: string      // CSS color (hex, rgba, gradient)
  x: string          // left position (css value)
  y: string          // top position
  w: string          // width
  h: string          // height
  anim: 1 | 2 | 3 | 4
  duration: number   // seconds
  delay: number      // seconds
  opacity: number
}

export interface AnimBgPreset {
  id: string
  name: string
  base: string        // solid base color
  blobs: BlobConfig[]
  previewCss: string  // static thumbnail CSS
}

export const ANIM_BACKGROUNDS: AnimBgPreset[] = [
  // ── Dark (moody) ──────────────────────────────────────────────────────────
  {
    id: 'anim-linear',
    name: 'Linear',
    base: '#090c1a',
    previewCss: 'radial-gradient(ellipse at 20% 70%, #3b4fd8 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, #6e3dd4 0%, transparent 55%), #090c1a',
    blobs: [
      { color: '#3b4fd8', x: '-10%', y: '30%',  w: '70%', h: '70%', anim: 1, duration: 22, delay: 0,  opacity: 0.65 },
      { color: '#6e3dd4', x: '50%',  y: '-10%', w: '60%', h: '60%', anim: 2, duration: 18, delay: -4, opacity: 0.55 },
      { color: '#1a5fa3', x: '20%',  y: '50%',  w: '50%', h: '50%', anim: 3, duration: 26, delay: -8, opacity: 0.45 },
    ],
  },
  {
    id: 'anim-aurora',
    name: 'Aurora',
    base: '#030810',
    previewCss: 'radial-gradient(ellipse at 20% 70%, #00c97a 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, #005fe0 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, #7000c8 0%, transparent 50%), #030810',
    blobs: [
      { color: '#00c97a', x: '-10%', y: '40%',  w: '65%', h: '65%', anim: 1, duration: 20, delay: 0,  opacity: 0.7 },
      { color: '#005fe0', x: '45%',  y: '-5%',  w: '55%', h: '55%', anim: 2, duration: 24, delay: -5, opacity: 0.6 },
      { color: '#7000c8', x: '25%',  y: '55%',  w: '50%', h: '50%', anim: 4, duration: 30, delay: -10, opacity: 0.5 },
    ],
  },
  {
    id: 'anim-nebula',
    name: 'Nebula',
    base: '#06000e',
    previewCss: 'radial-gradient(ellipse at 15% 80%, #ff2060 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #2040ff 0%, transparent 50%), radial-gradient(ellipse at 55% 45%, #8020d0 0%, transparent 50%), #06000e',
    blobs: [
      { color: '#ff2060', x: '-15%', y: '35%',  w: '70%', h: '70%', anim: 2, duration: 18, delay: 0,  opacity: 0.65 },
      { color: '#2040ff', x: '55%',  y: '-15%', w: '60%', h: '60%', anim: 1, duration: 22, delay: -3, opacity: 0.55 },
      { color: '#8020d0', x: '30%',  y: '45%',  w: '55%', h: '55%', anim: 3, duration: 28, delay: -7, opacity: 0.5 },
    ],
  },
  {
    id: 'anim-sunset',
    name: 'Sunset',
    base: '#160408',
    previewCss: 'radial-gradient(ellipse at 15% 85%, #ff5500 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, #ffa000 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #c01060 0%, transparent 60%), #160408',
    blobs: [
      { color: '#ff5500', x: '-10%', y: '40%',  w: '65%', h: '65%', anim: 1, duration: 20, delay: 0,  opacity: 0.75 },
      { color: '#ffa000', x: '50%',  y: '-10%', w: '55%', h: '55%', anim: 3, duration: 16, delay: -4, opacity: 0.65 },
      { color: '#c01060', x: '20%',  y: '35%',  w: '50%', h: '60%', anim: 2, duration: 24, delay: -8, opacity: 0.55 },
    ],
  },
  {
    id: 'anim-ocean',
    name: 'Ocean',
    base: '#010c18',
    previewCss: 'radial-gradient(ellipse at 20% 80%, #00c8c0 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #0050c0 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #008090 0%, transparent 60%), #010c18',
    blobs: [
      { color: '#00c8c0', x: '-10%', y: '40%',  w: '60%', h: '60%', anim: 3, duration: 22, delay: 0,  opacity: 0.65 },
      { color: '#0050c0', x: '50%',  y: '-10%', w: '65%', h: '65%', anim: 1, duration: 26, delay: -6, opacity: 0.6 },
      { color: '#008090', x: '20%',  y: '50%',  w: '45%', h: '55%', anim: 4, duration: 18, delay: -3, opacity: 0.45 },
    ],
  },
  {
    id: 'anim-rose',
    name: 'Rose',
    base: '#130010',
    previewCss: 'radial-gradient(ellipse at 20% 80%, #ff3090 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #ff80c0 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #c00060 0%, transparent 60%), #130010',
    blobs: [
      { color: '#ff3090', x: '-10%', y: '35%',  w: '65%', h: '65%', anim: 2, duration: 20, delay: 0,  opacity: 0.7 },
      { color: '#ff80c0', x: '45%',  y: '-10%', w: '55%', h: '60%', anim: 4, duration: 24, delay: -5, opacity: 0.55 },
      { color: '#c00060', x: '25%',  y: '50%',  w: '50%', h: '50%', anim: 1, duration: 28, delay: -9, opacity: 0.5 },
    ],
  },
  {
    id: 'anim-cosmic',
    name: 'Cosmic',
    base: '#050210',
    previewCss: 'radial-gradient(ellipse at 25% 75%, #b030ff 0%, transparent 55%), radial-gradient(ellipse at 75% 25%, #3070ff 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #ff2090 0%, transparent 55%), #050210',
    blobs: [
      { color: '#b030ff', x: '-5%',  y: '30%',  w: '60%', h: '70%', anim: 3, duration: 24, delay: 0,   opacity: 0.65 },
      { color: '#3070ff', x: '45%',  y: '-10%', w: '65%', h: '60%', anim: 1, duration: 20, delay: -6,  opacity: 0.6 },
      { color: '#ff2090', x: '30%',  y: '50%',  w: '45%', h: '50%', anim: 2, duration: 30, delay: -12, opacity: 0.45 },
    ],
  },
  {
    id: 'anim-forest',
    name: 'Forest',
    base: '#020e06',
    previewCss: 'radial-gradient(ellipse at 20% 80%, #00c040 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #007050 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #00e090 0%, transparent 55%), #020e06',
    blobs: [
      { color: '#00c040', x: '-10%', y: '40%',  w: '65%', h: '65%', anim: 1, duration: 22, delay: 0,  opacity: 0.65 },
      { color: '#007050', x: '50%',  y: '-10%', w: '55%', h: '60%', anim: 3, duration: 18, delay: -4, opacity: 0.55 },
      { color: '#00e090', x: '20%',  y: '45%',  w: '50%', h: '50%', anim: 2, duration: 26, delay: -8, opacity: 0.5 },
    ],
  },

  // ── Light (soft) ──────────────────────────────────────────────────────────
  {
    id: 'anim-morning',
    name: 'Morning',
    base: '#fff8f2',
    previewCss: 'radial-gradient(ellipse at 20% 80%, rgba(255,190,100,0.8) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(255,120,180,0.7) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(180,210,255,0.6) 0%, transparent 60%), #fff8f2',
    blobs: [
      { color: 'rgba(255,190,100,0.9)', x: '-10%', y: '40%',  w: '60%', h: '60%', anim: 1, duration: 22, delay: 0,  opacity: 0.75 },
      { color: 'rgba(255,100,180,0.8)', x: '45%',  y: '-10%', w: '55%', h: '55%', anim: 2, duration: 26, delay: -5, opacity: 0.65 },
      { color: 'rgba(150,200,255,0.7)', x: '20%',  y: '50%',  w: '50%', h: '50%', anim: 4, duration: 18, delay: -8, opacity: 0.5 },
    ],
  },
  {
    id: 'anim-cloud',
    name: 'Cloud',
    base: '#f6f6ff',
    previewCss: 'radial-gradient(ellipse at 20% 80%, rgba(160,160,255,0.75) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(220,160,255,0.7) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(160,220,255,0.65) 0%, transparent 60%), #f6f6ff',
    blobs: [
      { color: 'rgba(160,160,255,0.9)', x: '-10%', y: '35%',  w: '65%', h: '65%', anim: 3, duration: 24, delay: 0,  opacity: 0.7 },
      { color: 'rgba(220,160,255,0.8)', x: '45%',  y: '-10%', w: '60%', h: '55%', anim: 1, duration: 20, delay: -6, opacity: 0.6 },
      { color: 'rgba(160,220,255,0.7)', x: '25%',  y: '50%',  w: '50%', h: '55%', anim: 2, duration: 28, delay: -9, opacity: 0.5 },
    ],
  },
  {
    id: 'anim-spring',
    name: 'Spring',
    base: '#f4fff8',
    previewCss: 'radial-gradient(ellipse at 20% 80%, rgba(120,240,160,0.75) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(255,160,180,0.7) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(120,200,255,0.65) 0%, transparent 60%), #f4fff8',
    blobs: [
      { color: 'rgba(120,240,160,0.9)', x: '-10%', y: '40%',  w: '60%', h: '65%', anim: 2, duration: 22, delay: 0,  opacity: 0.7 },
      { color: 'rgba(255,140,170,0.8)', x: '50%',  y: '-10%', w: '60%', h: '55%', anim: 4, duration: 26, delay: -4, opacity: 0.6 },
      { color: 'rgba(100,190,255,0.7)', x: '20%',  y: '55%',  w: '45%', h: '50%', anim: 1, duration: 30, delay: -8, opacity: 0.5 },
    ],
  },
  {
    id: 'anim-peach',
    name: 'Peach',
    base: '#fff5ee',
    previewCss: 'radial-gradient(ellipse at 20% 80%, rgba(255,180,120,0.8) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(255,140,180,0.7) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,210,150,0.6) 0%, transparent 60%), #fff5ee',
    blobs: [
      { color: 'rgba(255,180,120,0.9)', x: '-10%', y: '40%',  w: '65%', h: '65%', anim: 1, duration: 20, delay: 0,  opacity: 0.75 },
      { color: 'rgba(255,120,170,0.8)', x: '45%',  y: '-10%', w: '60%', h: '60%', anim: 3, duration: 24, delay: -5, opacity: 0.65 },
      { color: 'rgba(255,200,140,0.7)', x: '25%',  y: '50%',  w: '50%', h: '50%', anim: 2, duration: 28, delay: -8, opacity: 0.5 },
    ],
  },
]

export const ANIM_BG_MAP: Record<string, AnimBgPreset> = Object.fromEntries(
  ANIM_BACKGROUNDS.map((b) => [b.id, b]),
)

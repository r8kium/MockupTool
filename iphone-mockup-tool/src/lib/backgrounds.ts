export interface PresetBg {
  id: string
  name: string
  category: 'mesh-dark' | 'mesh-light' | 'gradient' | 'solid' | 'photo-dark' | 'photo-vivid' | 'photo-light'
  css: string  // valid CSS `background` property value
}

const m = (...layers: string[]) => layers.join(', ')

export const PRESET_BACKGROUNDS: PresetBg[] = [

  // ── Mesh gradients — dark base (Raycast-style) ─────────────────────────────
  {
    id: 'sunset-mesh',
    name: 'Sunset',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 15% 85%, rgba(255,100,80,0.9) 0%, transparent 55%)',
      'radial-gradient(ellipse at 85% 15%, rgba(255,170,50,0.85) 0%, transparent 50%)',
      'radial-gradient(ellipse at 55% 45%, rgba(180,40,130,0.7) 0%, transparent 65%)',
      '#1a0820',
    ),
  },
  {
    id: 'ocean-mesh',
    name: 'Ocean',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(0,200,190,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(0,60,200,0.9) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(0,120,150,0.5) 0%, transparent 70%)',
      '#020d1e',
    ),
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 70%, rgba(0,255,120,0.8) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 30%, rgba(0,120,255,0.85) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 90%, rgba(130,0,255,0.7) 0%, transparent 60%)',
      '#050510',
    ),
  },
  {
    id: 'twilight',
    name: 'Twilight',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 25% 80%, rgba(100,0,255,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 75% 25%, rgba(0,80,255,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(60,0,130,0.5) 0%, transparent 70%)',
      '#08040f',
    ),
  },
  {
    id: 'rose-bloom',
    name: 'Rose',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(255,40,120,0.9) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,130,200,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(200,0,80,0.6) 0%, transparent 65%)',
      '#180010',
    ),
  },
  {
    id: 'forest-mist',
    name: 'Forest',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(0,200,60,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(0,130,90,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 30%, rgba(0,70,50,0.5) 0%, transparent 65%)',
      '#031008',
    ),
  },
  {
    id: 'arctic-ice',
    name: 'Arctic',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(0,230,255,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(0,100,255,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(180,240,255,0.4) 0%, transparent 60%)',
      '#020a18',
    ),
  },
  {
    id: 'candy-pop',
    name: 'Candy',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 15% 85%, rgba(255,0,170,0.9) 0%, transparent 55%)',
      'radial-gradient(ellipse at 85% 15%, rgba(255,130,0,0.85) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(130,0,255,0.7) 0%, transparent 60%)',
      '#0d0014',
    ),
  },
  {
    id: 'golden-dawn',
    name: 'Golden Hour',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(255,140,0,0.9) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.85) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(255,70,0,0.6) 0%, transparent 65%)',
      '#1a0a00',
    ),
  },
  {
    id: 'midnight-bloom',
    name: 'Midnight',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 30% 70%, rgba(30,30,255,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 70% 30%, rgba(130,0,200,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(0,20,140,0.5) 0%, transparent 70%)',
      '#03020a',
    ),
  },
  {
    id: 'tropical',
    name: 'Tropical',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(0,255,130,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,210,0,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(0,200,160,0.5) 0%, transparent 65%)',
      '#041a0a',
    ),
  },
  {
    id: 'nebula',
    name: 'Nebula',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(255,30,90,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(30,60,255,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 60% 40%, rgba(140,30,255,0.7) 0%, transparent 60%)',
      '#050005',
    ),
  },
  {
    id: 'lavender-haze',
    name: 'Lavender',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(160,60,255,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(200,130,255,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(100,15,180,0.5) 0%, transparent 65%)',
      '#0e081a',
    ),
  },
  {
    id: 'infrared',
    name: 'Infrared',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(255,60,0,0.9) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,130,160,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 30%, rgba(200,0,50,0.6) 0%, transparent 65%)',
      '#150008',
    ),
  },
  {
    id: 'electric-blue',
    name: 'Electric',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(0,200,255,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(0,60,255,0.9) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(0,130,200,0.5) 0%, transparent 65%)',
      '#000814',
    ),
  },
  {
    id: 'magma',
    name: 'Magma',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 30% 90%, rgba(255,50,0,0.95) 0%, transparent 50%)',
      'radial-gradient(ellipse at 70% 10%, rgba(255,200,0,0.85) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(255,100,0,0.6) 0%, transparent 65%)',
      '#120300',
    ),
  },
  {
    id: 'deep-sea',
    name: 'Deep Sea',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(0,180,140,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(0,40,120,0.9) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(0,80,100,0.5) 0%, transparent 70%)',
      '#000f18',
    ),
  },
  {
    id: 'cosmic-dust',
    name: 'Cosmic',
    category: 'mesh-dark',
    css: m(
      'radial-gradient(ellipse at 25% 75%, rgba(180,50,255,0.85) 0%, transparent 55%)',
      'radial-gradient(ellipse at 75% 25%, rgba(50,120,255,0.8) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(255,50,150,0.4) 0%, transparent 65%)',
      '#060310',
    ),
  },

  // ── Mesh gradients — light base ────────────────────────────────────────────
  {
    id: 'morning-light',
    name: 'Morning',
    category: 'mesh-light',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(255,200,120,0.8) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,120,190,0.7) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(190,220,255,0.6) 0%, transparent 65%)',
      '#fff8f0',
    ),
  },
  {
    id: 'cloud-nine',
    name: 'Cloud',
    category: 'mesh-light',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(180,180,255,0.75) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,180,255,0.7) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(180,230,255,0.6) 0%, transparent 65%)',
      '#f8f8ff',
    ),
  },
  {
    id: 'spring-bloom',
    name: 'Spring',
    category: 'mesh-light',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(160,255,120,0.75) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,170,190,0.7) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(120,220,255,0.6) 0%, transparent 65%)',
      '#f5fff5',
    ),
  },
  {
    id: 'peach-fuzz',
    name: 'Peach',
    category: 'mesh-light',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(255,200,150,0.8) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,150,200,0.7) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(255,220,180,0.5) 0%, transparent 65%)',
      '#fff5ee',
    ),
  },
  {
    id: 'lavender-mist',
    name: 'Mist',
    category: 'mesh-light',
    css: m(
      'radial-gradient(ellipse at 20% 80%, rgba(180,160,255,0.75) 0%, transparent 55%)',
      'radial-gradient(ellipse at 80% 20%, rgba(220,200,255,0.7) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 50%, rgba(200,220,255,0.5) 0%, transparent 65%)',
      '#f5f0ff',
    ),
  },

  // ── Clean 2-stop gradients ─────────────────────────────────────────────────
  {
    id: 'indigo-violet',
    name: 'Indigo',
    category: 'gradient',
    css: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
  },
  {
    id: 'sky-ocean',
    name: 'Sky',
    category: 'gradient',
    css: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
  },
  {
    id: 'mint-teal',
    name: 'Mint',
    category: 'gradient',
    css: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
  },
  {
    id: 'hot-flame',
    name: 'Flame',
    category: 'gradient',
    css: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  },
  {
    id: 'dark-slate',
    name: 'Slate',
    category: 'gradient',
    css: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
  },
  {
    id: 'peach-paradise',
    name: 'Sunset Grad',
    category: 'gradient',
    css: 'linear-gradient(135deg, #fde68a 0%, #f472b6 100%)',
  },
  {
    id: 'night-sky',
    name: 'Night',
    category: 'gradient',
    css: 'linear-gradient(160deg, #1e1b4b 0%, #0f0f1a 100%)',
  },
  {
    id: 'emerald-sea',
    name: 'Emerald',
    category: 'gradient',
    css: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
  },
  {
    id: 'deep-plum',
    name: 'Plum',
    category: 'gradient',
    css: 'linear-gradient(135deg, #7e22ce 0%, #4c1d95 100%)',
  },
  {
    id: 'rose-quartz',
    name: 'Rose Grad',
    category: 'gradient',
    css: 'linear-gradient(135deg, #fb7185 0%, #e879f9 100%)',
  },
  {
    id: 'steel-blue',
    name: 'Steel',
    category: 'gradient',
    css: 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)',
  },
  {
    id: 'warm-amber',
    name: 'Amber',
    category: 'gradient',
    css: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
  },

  // ── Studio solids ──────────────────────────────────────────────────────────
  {
    id: 'studio-white',
    name: 'White',
    category: 'solid',
    css: '#ffffff',
  },
  {
    id: 'studio-light',
    name: 'Light Grey',
    category: 'solid',
    css: '#f5f5f5',
  },
  {
    id: 'studio-warm',
    name: 'Warm White',
    category: 'solid',
    css: '#faf5f0',
  },
  {
    id: 'studio-charcoal',
    name: 'Charcoal',
    category: 'solid',
    css: '#2d2d2d',
  },
  {
    id: 'studio-dark',
    name: 'Dark',
    category: 'solid',
    css: '#1a1a1a',
  },
  {
    id: 'studio-black',
    name: 'Black',
    category: 'solid',
    css: '#000000',
  },
  {
    id: 'studio-navy',
    name: 'Navy',
    category: 'solid',
    css: '#0f172a',
  },

  // ── Photo backgrounds — Dark/Moody (Linear / Raycast dark style) ───────────
  {
    id: 'photo-dark-01',
    name: 'Dark Gradient',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-01.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-02',
    name: 'Dark Ink',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-02.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-03',
    name: 'Dark Texture',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-03.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-04',
    name: 'Dark Blur',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-04.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-05',
    name: 'Dark Haze',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-05.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-06',
    name: 'Dark Wash',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-06.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-depth',
    name: 'Depth',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-depth.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-ember',
    name: 'Ember',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-ember.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-midnight',
    name: 'Midnight',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-midnight.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-nebula',
    name: 'Nebula',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-nebula.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-twilight',
    name: 'Twilight',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-twilight.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-dark-void',
    name: 'Void',
    category: 'photo-dark',
    css: 'url(/backgrounds/dark-void.jpg) center/cover no-repeat',
  },

  // ── Photo backgrounds — Vivid/Abstract (Raycast colorful style) ────────────
  {
    id: 'photo-vivid-aurora',
    name: 'Aurora',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-aurora.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-blob',
    name: 'Blob',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-blob.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-burst',
    name: 'Burst',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-burst.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-candy',
    name: 'Candy',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-candy.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-dusk',
    name: 'Dusk',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-dusk.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-fluid',
    name: 'Fluid',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-fluid.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-neon',
    name: 'Neon',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-neon.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-plasma',
    name: 'Plasma',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-plasma.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-prism',
    name: 'Prism',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-prism.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-spectrum',
    name: 'Spectrum',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-spectrum.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-vivid-wave',
    name: 'Wave',
    category: 'photo-vivid',
    css: 'url(/backgrounds/vivid-wave.jpg) center/cover no-repeat',
  },

  // ── Photo backgrounds — Light/Clean (Reflect / Screen Studio style) ────────
  {
    id: 'photo-light-cloud',
    name: 'Cloud',
    category: 'photo-light',
    css: 'url(/backgrounds/light-cloud.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-light-dawn',
    name: 'Dawn',
    category: 'photo-light',
    css: 'url(/backgrounds/light-dawn.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-light-frost',
    name: 'Frost',
    category: 'photo-light',
    css: 'url(/backgrounds/light-frost.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-light-mist',
    name: 'Mist',
    category: 'photo-light',
    css: 'url(/backgrounds/light-mist.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-light-paper',
    name: 'Paper',
    category: 'photo-light',
    css: 'url(/backgrounds/light-paper.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-light-peach',
    name: 'Peach',
    category: 'photo-light',
    css: 'url(/backgrounds/light-peach.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-light-silk',
    name: 'Silk',
    category: 'photo-light',
    css: 'url(/backgrounds/light-silk.jpg) center/cover no-repeat',
  },
  {
    id: 'photo-light-smoke',
    name: 'Smoke',
    category: 'photo-light',
    css: 'url(/backgrounds/light-smoke.jpg) center/cover no-repeat',
  },
]

export const BG_MAP: Record<string, PresetBg> = Object.fromEntries(
  PRESET_BACKGROUNDS.map((b) => [b.id, b]),
)

export function getPresetCss(id: string): string {
  return BG_MAP[id]?.css ?? ''
}

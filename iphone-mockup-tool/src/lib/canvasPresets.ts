export interface CanvasPreset {
  id: string
  name: string
  platform: string
  width: number
  height: number
  group: 'Vertical' | 'Square' | 'Landscape' | 'App Store'
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  // ── Vertical ─────────────────────────────────────────────────────────────
  { id: 'story',        name: 'Story / Reel / Shorts', platform: 'Instagram · TikTok · YouTube', width: 1080, height: 1920, group: 'Vertical' },
  { id: 'portrait-45', name: 'Portrait Post',          platform: 'Instagram · Pinterest',         width: 1080, height: 1350, group: 'Vertical' },
  // ── Square ────────────────────────────────────────────────────────────────
  { id: 'square',       name: 'Square Post',            platform: 'Instagram · Facebook',          width: 1080, height: 1080, group: 'Square' },
  // ── Landscape ─────────────────────────────────────────────────────────────
  { id: 'twitter',      name: 'X / Twitter Post',       platform: 'X (Twitter)',                   width: 1200, height: 675,  group: 'Landscape' },
  { id: 'linkedin',     name: 'LinkedIn Post',          platform: 'LinkedIn',                      width: 1200, height: 627,  group: 'Landscape' },
  { id: 'facebook-ad', name: 'Facebook Ad',             platform: 'Facebook',                      width: 1200, height: 628,  group: 'Landscape' },
  { id: 'og',           name: 'OG / Link Preview',      platform: 'Web',                           width: 1200, height: 630,  group: 'Landscape' },
  { id: 'youtube',      name: 'YouTube Thumbnail',      platform: 'YouTube',                       width: 1280, height: 720,  group: 'Landscape' },
  // ── App Store ─────────────────────────────────────────────────────────────
  { id: 'appstore-67',  name: 'App Store 6.7"',         platform: 'Apple App Store',               width: 1290, height: 2796, group: 'App Store' },
  { id: 'appstore-61',  name: 'App Store 6.1"',         platform: 'Apple App Store',               width: 1179, height: 2556, group: 'App Store' },
  { id: 'appstore-55',  name: 'App Store 5.5"',         platform: 'Apple App Store',               width: 1242, height: 2208, group: 'App Store' },
  { id: 'appstore-ipad',name: 'App Store iPad 12.9"',   platform: 'Apple App Store',               width: 2048, height: 2732, group: 'App Store' },
]

export const CANVAS_PRESET_MAP: Record<string, CanvasPreset> = Object.fromEntries(
  CANVAS_PRESETS.map(p => [p.id, p])
)

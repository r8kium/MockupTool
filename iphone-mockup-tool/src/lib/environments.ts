export type DreiPreset = 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse'

export interface EnvironmentPreset {
  id: DreiPreset
  name: string
  /** Gradient hint shown on the swatch button */
  swatch: string
  /** IBL intensity multiplier */
  intensity: number
}

export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  { id: 'studio',    name: 'Studio',    swatch: 'linear-gradient(135deg,#555,#aaa)',    intensity: 1.0 },
  { id: 'lobby',     name: 'Lobby',     swatch: 'linear-gradient(135deg,#b89a70,#e0c898)', intensity: 0.9 },
  { id: 'apartment', name: 'Apartment', swatch: 'linear-gradient(135deg,#c07848,#eaaa70)', intensity: 0.8 },
  { id: 'city',      name: 'City',      swatch: 'linear-gradient(135deg,#4a6a96,#88aacc)', intensity: 1.0 },
  { id: 'dawn',      name: 'Dawn',      swatch: 'linear-gradient(135deg,#c87070,#f0a898)', intensity: 1.0 },
  { id: 'sunset',    name: 'Sunset',    swatch: 'linear-gradient(135deg,#d06030,#f09050)', intensity: 0.9 },
  { id: 'forest',    name: 'Forest',    swatch: 'linear-gradient(135deg,#507850,#88b878)', intensity: 0.9 },
  { id: 'park',      name: 'Park',      swatch: 'linear-gradient(135deg,#68a040,#a0d060)', intensity: 1.0 },
  { id: 'warehouse', name: 'Warehouse', swatch: 'linear-gradient(135deg,#405060,#708090)', intensity: 1.0 },
  { id: 'night',     name: 'Night',     swatch: 'linear-gradient(135deg,#101828,#283848)', intensity: 1.3 },
]

export const ENVIRONMENT_PRESET_MAP = Object.fromEntries(
  ENVIRONMENT_PRESETS.map((e) => [e.id, e])
) as Record<DreiPreset, EnvironmentPreset>

export type DeviceCategory = 'iphone' | 'ipad' | 'mac' | 'watch' | 'android' | 'generic'

export type DeviceId =
  // iPhones
  | 'iphone-15-pro'
  | 'iphone-15-pro-max'
  | 'iphone-15'
  | 'iphone-15-plus'
  | 'iphone-14-pro'
  | 'iphone-13-pro-max'
  | 'iphone-13'
  | 'iphone-13-mini'
  | 'iphone-12-pro-bezel-less'
  | 'iphone-12-2020'
  | 'pro-max-notchless'
  // iPads
  | 'ipad-mini-6'
  | 'ipad-2021-magic-keyboard'
  | 'generic-tablet'
  | 'infinity-tablet'
  // Macs
  | 'macbook-pro-m3-16'
  | 'macbook-pro-m3-14'
  | 'macbook-pro-m1-16'
  | 'macbook-air-m2-15'
  | 'macbook-air-m2-13'
  | 'macbook-air-m1'
  | 'imac-24'
  | 'surface-laptop-4'
  // Watches
  | 'watch-ultra-2'
  | 'watch-series-7'
  | 'watch-series-6'
  // iPhone 17
  | 'iphone-17-pro-max'
  // iPhone 16
  | 'iphone-16-pro-max'
  | 'iphone-16-pro'
  | 'iphone-16-plus'
  | 'iphone-16'
  // Android / Generic phones
  | 'galaxy-s25-plus'
  | 'galaxy-s25'
  | 'samsung-s21'
  | 'generic-phone-thin-bezel'
  | 'glass-phone'
  | 'phone-display'

export interface DeviceColor {
  id: string
  label: string
  hex: string
}

export interface DeviceModel {
  id: DeviceId
  name: string
  gltfPath: string
  thumbnailPath: string
  category: DeviceCategory
  colors: DeviceColor[]
  screenAspect: number
  modelScale: number
  /** override camera positions for this device category shape */
  camPresets?: {
    front: [number, number, number]
    isometric: [number, number, number]
    side: [number, number, number]
  }
}

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'image'

export interface BackgroundConfig {
  type: BackgroundType
  solidColor?: string
  gradientFrom?: string
  gradientTo?: string
  gradientAngle?: number
  imageDataUrl?: string
}

export interface EditorState {
  screenshot: string | null
  deviceId: DeviceId
  colorId: string
  background: BackgroundConfig
  shadow: boolean
  cameraAngle: 'front' | 'isometric' | 'side'
}

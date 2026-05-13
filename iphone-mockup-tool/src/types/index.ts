export type DeviceId =
  | 'iphone-16-pro'
  | 'iphone-15-pro'
  | 'iphone-15-pro-max'
  | 'iphone-15'
  | 'iphone-15-plus'
  | 'iphone-14-pro'
  | 'iphone-13-pro-max'
  | 'iphone-13'
  | 'iphone-13-mini'

export interface DeviceColor {
  id: string
  label: string
  /** hex color used to tint the body material */
  hex: string
}

export interface DeviceModel {
  id: DeviceId
  name: string
  /** path relative to /public/models/ */
  gltfPath: string
  colors: DeviceColor[]
  /** aspect ratio of the screen mesh (used to warn user about mismatched screenshots) */
  screenAspect: number
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

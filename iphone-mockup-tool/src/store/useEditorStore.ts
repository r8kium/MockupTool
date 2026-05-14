import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BackgroundConfig, DeviceId, EditorState } from '@/types'
import { DEVICE_MODELS } from '@/lib/frames'

export type ShadowPreset = 'none' | 'soft' | 'long' | 'short'

interface EditorActions {
  setScreenshot: (dataUrl: string | null) => void
  setDevice: (deviceId: DeviceId) => void
  setColor: (colorId: string) => void
  setCustomColor: (hex: string) => void
  setBackground: (bg: BackgroundConfig) => void
  setShadowPreset: (preset: ShadowPreset) => void
  setCameraAngle: (angle: EditorState['cameraAngle']) => void
  setAnimTemplate: (id: string | null) => void
  reset: () => void
}

type FullState = EditorState & { shadowPreset: ShadowPreset; animTemplateId: string | null }

const DEFAULT_STATE: FullState = {
  screenshot: null,
  deviceId: 'iphone-15-pro',
  colorId: 'natural',
  customColorHex: null,
  background: { type: 'transparent' },
  shadow: true,
  shadowPreset: 'long',
  cameraAngle: 'isometric',
  animTemplateId: null,
}

export const useEditorStore = create<FullState & EditorActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      setScreenshot: (screenshot) => set({ screenshot }),
      setDevice: (deviceId) => {
        const device = DEVICE_MODELS[deviceId]
        const currentColorId = get().colorId
        const colorValid = device.colors.some((c) => c.id === currentColorId)
        set({ deviceId, colorId: colorValid ? currentColorId : device.colors[0].id })
      },
      setColor: (colorId) => set({ colorId, customColorHex: null }),
      setCustomColor: (hex) => set({ colorId: 'custom', customColorHex: hex }),
      setBackground: (background) => set({ background }),
      setShadowPreset: (shadowPreset) => set({ shadowPreset, shadow: shadowPreset !== 'none' }),
      setCameraAngle: (cameraAngle) => set({ cameraAngle }),
      setAnimTemplate: (animTemplateId) => set({ animTemplateId }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'mockup-editor-v2',
      partialize: (state) => {
        const { screenshot, ...rest } = state
        return rest as FullState & EditorActions
      },
    }
  )
)

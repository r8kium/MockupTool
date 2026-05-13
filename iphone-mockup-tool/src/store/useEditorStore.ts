import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BackgroundConfig, DeviceId, EditorState } from '@/types'

export type ShadowPreset = 'none' | 'soft' | 'long' | 'short'

interface EditorActions {
  setScreenshot: (dataUrl: string | null) => void
  setDevice: (deviceId: DeviceId) => void
  setColor: (colorId: string) => void
  setBackground: (bg: BackgroundConfig) => void
  setShadowPreset: (preset: ShadowPreset) => void
  setCameraAngle: (angle: EditorState['cameraAngle']) => void
  reset: () => void
}

type FullState = EditorState & { shadowPreset: ShadowPreset }

const DEFAULT_STATE: FullState = {
  screenshot: null,
  deviceId: 'iphone-15-pro',
  colorId: 'natural',
  background: { type: 'transparent' },
  shadow: true,
  shadowPreset: 'long',
  cameraAngle: 'isometric',
}

export const useEditorStore = create<FullState & EditorActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setScreenshot: (screenshot) => set({ screenshot }),
      setDevice: (deviceId) => set({ deviceId }),
      setColor: (colorId) => set({ colorId }),
      setBackground: (background) => set({ background }),
      setShadowPreset: (shadowPreset) => set({ shadowPreset, shadow: shadowPreset !== 'none' }),
      setCameraAngle: (cameraAngle) => set({ cameraAngle }),
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

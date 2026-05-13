import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BackgroundConfig, DeviceId, EditorState } from '@/types'

interface EditorActions {
  setScreenshot: (dataUrl: string | null) => void
  setDevice: (deviceId: DeviceId) => void
  setColor: (colorId: string) => void
  setBackground: (bg: BackgroundConfig) => void
  toggleShadow: () => void
  setCameraAngle: (angle: EditorState['cameraAngle']) => void
  reset: () => void
}

const DEFAULT_STATE: EditorState = {
  screenshot: null,
  deviceId: 'iphone-16-pro',
  colorId: 'natural',
  background: { type: 'transparent' },
  shadow: true,
  cameraAngle: 'isometric',
}

export const useEditorStore = create<EditorState & EditorActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setScreenshot: (screenshot) => set({ screenshot }),
      setDevice: (deviceId) => set({ deviceId }),
      setColor: (colorId) => set({ colorId }),
      setBackground: (background) => set({ background }),
      toggleShadow: () => set((s) => ({ shadow: !s.shadow })),
      setCameraAngle: (cameraAngle) => set({ cameraAngle }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'mockup-editor-3d',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { screenshot, ...rest } = state
        return rest as EditorState & EditorActions
      },
    }
  )
)

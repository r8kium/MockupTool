import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BackgroundConfig, DeviceId, EditorState, TextLayer, TextAnimPreset } from '@/types'
import { DEVICE_MODELS } from '@/lib/frames'

export type ShadowPreset = 'none' | 'soft' | 'long' | 'short'

const DEFAULT_EASING: [number,number,number,number] = [0.4, 0, 0.2, 1]

function makeTextLayer(overrides: Partial<TextLayer> = {}): TextLayer {
  return {
    id: crypto.randomUUID(),
    text: 'Your text here',
    x: 50, y: 50, width: 80,
    fontFamily: 'Inter',
    fontSize: 64,
    fontWeight: 700,
    fontStyle: 'normal',
    color: '#ffffff',
    opacity: 1,
    align: 'center',
    letterSpacing: 0,
    lineHeight: 1.2,
    startTime: 0,
    duration: -1,
    enterAnim: 'fade-in' as TextAnimPreset,
    enterDuration: 0.5,
    enterEasing: DEFAULT_EASING,
    exitAnim: 'none' as TextAnimPreset,
    exitDuration: 0.4,
    exitEasing: DEFAULT_EASING,
    visible: true,
    locked: false,
    ...overrides,
  }
}

interface EditorActions {
  setScreenshot: (dataUrl: string | null) => void
  setDevice: (deviceId: DeviceId) => void
  setColor: (colorId: string) => void
  setCustomColor: (hex: string) => void
  setBackground: (bg: BackgroundConfig) => void
  setShadowPreset: (preset: ShadowPreset) => void
  setCameraAngle: (angle: EditorState['cameraAngle']) => void
  setAnimTemplate: (id: string | null) => void
  setEnvironment: (id: string | null) => void
  setCanvasPreset: (id: string | null) => void
  // Text layer actions
  addTextLayer: (overrides?: Partial<TextLayer>) => void
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void
  deleteTextLayer: (id: string) => void
  reorderTextLayers: (fromIdx: number, toIdx: number) => void
  selectLayer: (id: string | null) => void
  reset: () => void
}

type FullState = EditorState & {
  shadowPreset: ShadowPreset
  animTemplateId: string | null
  environmentId: string | null
  canvasPresetId: string | null
  textLayers: TextLayer[]
  selectedLayerId: string | null
}

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
  environmentId: null,
  canvasPresetId: null,
  textLayers: [],
  selectedLayerId: null,
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
      setEnvironment: (environmentId) => set({ environmentId }),
      setCanvasPreset: (canvasPresetId) => set({ canvasPresetId }),
      addTextLayer: (overrides = {}) => {
        const layer = makeTextLayer(overrides)
        set((s) => ({ textLayers: [...s.textLayers, layer], selectedLayerId: layer.id }))
      },
      updateTextLayer: (id, updates) =>
        set((s) => ({
          textLayers: s.textLayers.map((l) => l.id === id ? { ...l, ...updates } : l),
        })),
      deleteTextLayer: (id) =>
        set((s) => ({
          textLayers: s.textLayers.filter((l) => l.id !== id),
          selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
        })),
      reorderTextLayers: (fromIdx, toIdx) =>
        set((s) => {
          const arr = [...s.textLayers]
          const [moved] = arr.splice(fromIdx, 1)
          arr.splice(toIdx, 0, moved)
          return { textLayers: arr }
        }),
      selectLayer: (id) => set({ selectedLayerId: id }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'mockup-editor-v4',
      partialize: (state) => {
        const { screenshot, ...rest } = state
        return rest as FullState & EditorActions
      },
    }
  )
)

export { makeTextLayer }

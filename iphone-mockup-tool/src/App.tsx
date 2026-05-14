import { useState } from 'react'
import { Home } from '@/views/Home'
import { DeviceBrowser } from '@/views/DeviceBrowser'
import { Editor } from '@/views/Editor'
import { SceneEditor } from '@/views/SceneEditor'
import { useEditorStore } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'
import type { DeviceId, SceneTemplate } from '@/types'

type View = 'home' | 'browser' | 'editor' | 'scene'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [activeScene, setActiveScene] = useState<SceneTemplate | null>(null)
  const { setDevice, setColor } = useEditorStore()

  const handleSelectDevice = (id: DeviceId) => {
    const device = DEVICE_MODELS[id]
    setDevice(id)
    setColor(device.colors[0].id)
    setActiveScene(null)
    setView('editor')
  }

  const handleSelectScene = (scene: SceneTemplate) => {
    setActiveScene(scene)
    setView('scene')
  }

  if (view === 'home') {
    return <Home onStart={() => setView('browser')} />
  }

  if (view === 'browser') {
    return (
      <DeviceBrowser
        onSelect={handleSelectDevice}
        onSelectScene={handleSelectScene}
        onHome={() => setView('home')}
      />
    )
  }

  if (view === 'scene' && activeScene) {
    return <SceneEditor scene={activeScene} onBack={() => setView('browser')} />
  }

  return <Editor onBack={() => setView('browser')} />
}

import { useState } from 'react'
import { DeviceBrowser } from '@/views/DeviceBrowser'
import { Editor } from '@/views/Editor'
import { useEditorStore } from '@/store/useEditorStore'
import { DEVICE_MODELS } from '@/lib/frames'
import type { DeviceId } from '@/types'

export default function App() {
  const [view, setView] = useState<'browser' | 'editor'>('editor')
  const { setDevice, setColor } = useEditorStore()

  const handleSelectDevice = (id: DeviceId) => {
    const device = DEVICE_MODELS[id]
    setDevice(id)
    setColor(device.colors[0].id)
    setView('editor')
  }

  if (view === 'browser') {
    return <DeviceBrowser onSelect={handleSelectDevice} />
  }

  return <Editor onBack={() => setView('browser')} />
}

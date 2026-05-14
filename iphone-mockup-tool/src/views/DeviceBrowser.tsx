import { useState, useMemo } from 'react'
import { Search, Monitor, Layers } from 'lucide-react'
import { DEVICE_LIST, DEVICE_CATEGORIES } from '@/lib/frames'
import { SCENE_TEMPLATES } from '@/lib/compositions'
import { useEditorStore } from '@/store/useEditorStore'
import type { DeviceCategory, DeviceId, SceneTemplate } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  onSelect: (id: DeviceId) => void
  onSelectScene: (scene: SceneTemplate) => void
}

type Tab = 'devices' | 'scenes'

export function DeviceBrowser({ onSelect, onSelectScene }: Props) {
  const { deviceId } = useEditorStore()
  const [tab, setTab] = useState<Tab>('devices')
  const [category, setCategory] = useState<DeviceCategory | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = DEVICE_LIST
    if (category !== 'all') list = list.filter((d) => d.category === category)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(q))
    }
    return list
  }, [category, query])

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-[220px] flex-shrink-0 bg-[#252525] flex flex-col border-r border-white/5">
        <div className="p-4 pt-8">
          <nav className="space-y-0.5">
            <SidebarItem icon={<Monitor className="w-4 h-4" />} label="Devices" active={tab === 'devices'} onClick={() => setTab('devices')} />
            <SidebarItem icon={<Layers className="w-4 h-4" />} label="Scenes" active={tab === 'scenes'} onClick={() => setTab('scenes')} />
          </nav>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {tab === 'devices' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 flex-shrink-0">
              <h1 className="text-3xl font-bold">Devices</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-64 bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/8"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 px-8 pb-4 flex-shrink-0 border-b border-white/5">
              {DEVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    category === cat.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Device grid */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-white/30">
                  <Monitor className="w-10 h-10 mb-3" />
                  <p className="text-sm">No devices found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filtered.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => onSelect(device.id)}
                      className={cn(
                        'group flex flex-col rounded-xl overflow-hidden border transition-all text-left',
                        deviceId === device.id
                          ? 'border-blue-500/60 bg-blue-500/10'
                          : 'border-white/8 bg-white/4 hover:border-white/20 hover:bg-white/8'
                      )}
                    >
                      <div className="aspect-[4/3] bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                        <img
                          src={device.thumbnailPath}
                          alt={device.name}
                          className="w-full h-full object-contain p-3"
                          onError={(e) => { ;(e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-xs text-white/70 leading-snug line-clamp-2">{device.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Scenes header */}
            <div className="px-8 pt-8 pb-4 flex-shrink-0">
              <h1 className="text-3xl font-bold">Multi-Screen Scenes</h1>
              <p className="text-sm text-white/40 mt-1">Compositions with multiple devices — click each screen to upload a screenshot</p>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {SCENE_TEMPLATES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => onSelectScene(scene)}
                    className="group flex flex-col rounded-xl overflow-hidden border border-white/8 bg-white/4 hover:border-white/20 hover:bg-white/8 transition-all text-left"
                  >
                    <div className="aspect-[4/3] bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                      <img
                        src={scene.thumbnailPath}
                        alt={scene.name}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 12h20"/><path d="M12 2v20"/></svg></div>' }}
                      />
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-medium text-white/70">{scene.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">{scene.slots.length} devices</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
        active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

import { useState, useMemo } from 'react'
import { ArrowLeft, Search, CloudDownload, CheckCircle2, Loader2 } from 'lucide-react'
import { DEVICE_LIST } from '@/lib/frames'
import { SCENE_TEMPLATES } from '@/lib/compositions'
import { useEditorStore } from '@/store/useEditorStore'
import type { DeviceCategory, DeviceId, SceneTemplate } from '@/types'
import { cn } from '@/lib/utils'
import { useModelStatus, useLoadedCount, preloadAll, retryModel } from '@/lib/modelCache'

interface Props {
  onSelect: (id: DeviceId) => void
  onSelectScene: (scene: SceneTemplate) => void
  onHome: () => void
}

type Filter = DeviceCategory | 'all' | 'scenes'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'scenes',  label: 'Multi-Device' },
  { id: 'iphone',  label: 'iPhone' },
  { id: 'ipad',    label: 'iPad' },
  { id: 'mac',     label: 'Mac' },
  { id: 'watch',   label: 'Watch' },
  { id: 'android', label: 'Android' },
  { id: 'generic', label: 'Generic' },
]

const ALL_GLTF_PATHS = DEVICE_LIST.map(d => d.gltfPath)

export function DeviceBrowser({ onSelect, onSelectScene, onHome }: Props) {
  const { deviceId } = useEditorStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [query,  setQuery]  = useState('')

  const loadedCount = useLoadedCount(ALL_GLTF_PATHS)
  const totalCount  = ALL_GLTF_PATHS.length
  const allCached   = loadedCount === totalCount
  const anyLoading  = loadedCount < totalCount && loadedCount > 0

  const filteredDevices = useMemo(() => {
    let list = DEVICE_LIST
    if (filter !== 'all' && filter !== 'scenes') list = list.filter((d) => d.category === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(q))
    }
    return list
  }, [filter, query])

  const filteredScenes = useMemo(() => {
    if (filter !== 'all' && filter !== 'scenes') return []
    if (query.trim()) {
      const q = query.toLowerCase()
      return SCENE_TEMPLATES.filter((s) => s.name.toLowerCase().includes(q))
    }
    return SCENE_TEMPLATES
  }, [filter, query])

  const showScenes  = filter === 'all' || filter === 'scenes'
  const showDevices = filter !== 'scenes'

  return (
    <div className="h-screen bg-[#0d0d0d] text-white flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold tracking-tight text-base text-white">Mockup Tool</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Cache status + preload button */}
            <div className="flex items-center gap-2">
              {allCached ? (
                <span className="flex items-center gap-1.5 text-emerald-400/70 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All {totalCount} models cached
                </span>
              ) : (
                <>
                  <span className="text-white/30 text-xs tabular-nums">
                    {loadedCount} / {totalCount} cached
                  </span>
                  <button
                    onClick={() => preloadAll(ALL_GLTF_PATHS)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/20 hover:border-violet-500/35 text-violet-300/80 hover:text-violet-200 text-xs font-medium transition-all"
                  >
                    {anyLoading
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <CloudDownload className="w-3 h-3" />
                    }
                    {anyLoading ? 'Caching…' : 'Cache all'}
                  </button>
                </>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setFilter('all') }}
                placeholder="Search devices & scenes…"
                className="w-64 bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/8 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all',
                filter === f.id
                  ? 'bg-white text-[#0d0d0d]'
                  : 'bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/80 border border-white/8'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

        {/* Scenes */}
        {showScenes && filteredScenes.length > 0 && (
          <section>
            {filter === 'all' && (
              <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
                Multi-Device Scenes
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredScenes.map((scene) => (
                <SceneCard key={scene.id} scene={scene} onClick={() => onSelectScene(scene)} />
              ))}
            </div>
          </section>
        )}

        {/* Devices */}
        {showDevices && filteredDevices.length > 0 && (
          <section>
            {filter === 'all' && (
              <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
                Devices
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  name={device.name}
                  thumbnailPath={device.thumbnailPath}
                  gltfPath={device.gltfPath}
                  active={deviceId === device.id}
                  onClick={() => onSelect(device.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filteredDevices.length === 0 && filteredScenes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-white/20">
            <Search className="w-8 h-8 mb-3" />
            <p className="text-sm">No results for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DeviceCard({ name, thumbnailPath, gltfPath, active, onClick }: {
  name: string
  thumbnailPath: string
  gltfPath: string
  active: boolean
  onClick: () => void
}) {
  const status = useModelStatus(gltfPath)

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col rounded-2xl overflow-hidden border transition-all text-left',
        active
          ? 'border-blue-500/50 bg-blue-500/8 ring-1 ring-blue-500/30'
          : 'border-white/6 bg-white/3 hover:border-white/15 hover:bg-white/6'
      )}
    >
      <div className="aspect-[4/3] relative flex items-center justify-center overflow-hidden bg-white/3">
        <img
          src={thumbnailPath}
          alt={name}
          className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
        />
        {/* Cache status badge */}
        <div className="absolute top-2 right-2">
          {status === 'loaded' && (
            <div className="w-2 h-2 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          )}
          {status === 'loading' && (
            <Loader2 className="w-3 h-3 text-violet-400/80 animate-spin" />
          )}
          {status === 'error' && (
            <button
              onClick={(e) => { e.stopPropagation(); retryModel(gltfPath) }}
              title="Failed to load — click to retry"
              className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[8px] font-bold flex items-center justify-center hover:bg-red-500/35 transition-colors"
            >
              !
            </button>
          )}
          {status === 'idle' && (
            <CloudDownload className="w-3 h-3 text-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-white/60 leading-snug line-clamp-2 group-hover:text-white/80 transition-colors">
          {name}
        </p>
      </div>
    </button>
  )
}

function SceneCard({ scene, onClick }: { scene: SceneTemplate; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/6 bg-white/3 hover:border-white/15 hover:bg-white/6 transition-all text-left"
    >
      <div className="aspect-[4/3] flex items-center justify-center overflow-hidden bg-white/3 relative">
        <img
          src={scene.thumbnailPath}
          alt={scene.name}
          className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.opacity = '0'
          }}
        />
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[9px] font-semibold text-white/50 uppercase tracking-wide">
          {scene.slots.length}×
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">{scene.name}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{scene.slots.length} devices</p>
      </div>
    </button>
  )
}

import { useRef, useEffect, useState, useMemo } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { animClock } from '@/lib/animClock'
import type { AnimTemplate, TextLayer } from '@/types'
import { useEditorStore } from '@/store/useEditorStore'
import { cn } from '@/lib/utils'

function fmt(s: number): string {
  const sec = Math.floor(s)
  const tenth = Math.floor((s % 1) * 10)
  return `${sec}.${tenth}s`
}

// ── Track bar for a single text layer ────────────────────────────────────────
function TextTrack({ layer, totalDuration, isSelected, onClick }: {
  layer: TextLayer
  totalDuration: number
  isSelected: boolean
  onClick: () => void
}) {
  const effectiveDuration = layer.duration < 0
    ? totalDuration - layer.startTime
    : layer.duration
  const start  = (layer.startTime / totalDuration) * 100
  const width  = Math.max(2, (effectiveDuration / totalDuration) * 100)
  const enterW = layer.enterAnim !== 'none'
    ? (layer.enterDuration / totalDuration) * 100 : 0
  const exitW  = layer.exitAnim !== 'none'
    ? (layer.exitDuration / totalDuration) * 100 : 0

  return (
    <div className="relative h-5 flex items-center group cursor-pointer" onClick={onClick}>
      {/* Label */}
      <span className={cn(
        'absolute left-0 text-[9px] font-medium truncate pr-1 transition-colors z-10 pointer-events-none',
        isSelected ? 'text-indigo-300' : 'text-white/30'
      )} style={{ width: `${start}%`, textAlign: 'right' }}>
        {layer.text.slice(0, 12)}
      </span>

      {/* Bar */}
      <div className="absolute h-2 rounded-full overflow-hidden"
        style={{ left: `${start}%`, width: `${width}%` }}
      >
        {/* Hold region */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: isSelected ? 'rgba(99,102,241,0.5)' : `${layer.color}33` }}
        />
        {/* Enter ramp */}
        {enterW > 0 && (
          <div className="absolute left-0 top-0 bottom-0 rounded-l-full"
            style={{
              width: `${Math.min(enterW / width * 100, 100)}%`,
              background: isSelected ? 'rgba(99,102,241,0.9)' : layer.color,
              opacity: 0.8,
            }}
          />
        )}
        {/* Exit ramp */}
        {exitW > 0 && (
          <div className="absolute right-0 top-0 bottom-0 rounded-r-full"
            style={{
              width: `${Math.min(exitW / width * 100, 100)}%`,
              background: isSelected ? 'rgba(99,102,241,0.6)' : `${layer.color}99`,
            }}
          />
        )}
      </div>
    </div>
  )
}

// ── Main timeline ─────────────────────────────────────────────────────────────
interface Props {
  animTemplate: AnimTemplate | null
}

export function UniversalTimeline({ animTemplate }: Props) {
  const { textLayers, selectedLayerId, selectLayer } = useEditorStore()

  // Compute total duration
  const totalDuration = useMemo(() => {
    const camDur = animTemplate
      ? animTemplate.keyframes.reduce((s, kf) => s + kf.duration, 0)
      : 0
    const textDur = textLayers.reduce((max, l) => {
      const enter = l.enterAnim !== 'none' ? l.enterDuration : 0
      const exit  = l.exitAnim  !== 'none' ? l.exitDuration  : 0
      const hold  = l.duration < 0 ? Math.max(3, enter + exit + 1) : l.duration
      return Math.max(max, l.startTime + hold + 0.5)
    }, 0)
    return Math.max(camDur, textDur, (camDur > 0 || textDur > 0) ? 2 : 0)
  }, [animTemplate, textLayers])

  const [paused, setPaused] = useState(animClock.paused)
  const scrubRef  = useRef<HTMLInputElement>(null)
  const timeRef   = useRef<HTMLSpanElement>(null)
  const headRef   = useRef<HTMLDivElement>(null)
  const rafRef    = useRef(0)

  // RAF — direct DOM mutation for 60fps
  useEffect(() => {
    const tick = () => {
      const t = animTemplate ? animClock.elapsed : animClock.elapsedForText
      const loop = t % totalDuration
      if (scrubRef.current) scrubRef.current.value = String((loop / totalDuration) * 1000)
      if (timeRef.current)  timeRef.current.textContent = fmt(loop)
      if (headRef.current)  headRef.current.style.left = `${(loop / totalDuration) * 100}%`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animTemplate, totalDuration])

  // Cleanup on unmount
  useEffect(() => () => { animClock.paused = false }, [])

  if (totalDuration <= 0) return null

  const togglePlay = () => {
    const next = !animClock.paused
    animClock.paused = next
    setPaused(next)
  }

  const restart = () => {
    animClock.resetTextPreview = true
    animClock.seekTo = 0
    animClock.paused = false
    setPaused(false)
  }

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = (parseInt(e.target.value) / 1000) * totalDuration
    animClock.seekTo = t
    if (!animTemplate) {
      animClock.elapsedForText = t
    }
  }

  const hasTextTracks = textLayers.length > 0
  const hasCameraTrack = !!animTemplate

  return (
    <div className="flex-shrink-0 bg-[#111111] border-t border-white/[0.06] select-none">

      {/* ── Track area ──────────────────────────────────────────────────── */}
      {(hasTextTracks || hasCameraTrack) && (
        <div className="px-12 pt-2 pb-1 space-y-0.5">
          {/* Camera track */}
          {hasCameraTrack && (
            <div className="relative h-4 flex items-center">
              <span className="absolute text-[8px] text-white/20 font-medium" style={{ left: 0 }}>CAM</span>
              <div className="absolute left-4 right-0 h-1.5 rounded-full bg-blue-500/25">
                <div className="absolute left-0 top-0 bottom-0 w-full rounded-full bg-blue-500/50" />
              </div>
            </div>
          )}
          {/* Text tracks */}
          {textLayers.map((layer) => (
            <TextTrack
              key={layer.id}
              layer={layer}
              totalDuration={totalDuration}
              isSelected={selectedLayerId === layer.id}
              onClick={() => selectLayer(layer.id)}
            />
          ))}
        </div>
      )}

      {/* ── Playback controls ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Restart */}
        <button onClick={restart}
          className="text-white/35 hover:text-white/70 transition-colors flex-shrink-0"
          title="Restart (R)">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Play / Pause */}
        <button onClick={togglePlay}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
          title={paused ? 'Play (Space)' : 'Pause (Space)'}>
          {paused
            ? <Play className="w-3 h-3 translate-x-px" />
            : <Pause className="w-3 h-3" />}
        </button>

        {/* Scrub track — positioned with playhead */}
        <div className="relative flex-1 flex items-center">
          {/* Ticks */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10 -translate-y-1/2 pointer-events-none" />
          {/* Playhead line */}
          <div ref={headRef} className="absolute w-0.5 h-3 bg-white/60 rounded-full -translate-x-1/2 pointer-events-none z-10"
            style={{ left: '0%' }} />
          {/* Range input */}
          <input
            ref={scrubRef}
            type="range" min={0} max={1000} step={1} defaultValue={0}
            onChange={onScrub}
            className="w-full h-1 appearance-none bg-transparent cursor-pointer accent-indigo-500 relative z-20"
          />
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span ref={timeRef} className="text-xs font-mono text-white/70 tabular-nums w-10 text-right">0.0s</span>
          <span className="text-xs text-white/20">/</span>
          <span className="text-xs font-mono text-white/30 tabular-nums">{fmt(totalDuration)}</span>
        </div>
      </div>

      {/* ── Keyboard hint ────────────────────────────────────────────────── */}
      <div className="px-4 pb-1.5 flex items-center gap-3">
        <span className="text-[9px] text-white/15">Space — play/pause</span>
        <span className="text-[9px] text-white/15">R — restart</span>
        {textLayers.length > 0 && <span className="text-[9px] text-white/15">Click tracks to select layer</span>}
      </div>
    </div>
  )
}

import { useRef, useEffect, useState, useMemo } from 'react'
import { Pause, Play } from 'lucide-react'
import { animClock } from '@/lib/animClock'
import type { AnimTemplate } from '@/types'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface Props {
  animTemplate: AnimTemplate
}

export function SeekBar({ animTemplate }: Props) {
  const totalDuration = useMemo(
    () => animTemplate.keyframes.reduce((s, kf) => s + kf.duration, 0),
    [animTemplate],
  )

  const [paused, setPaused] = useState(false)
  const sliderRef = useRef<HTMLInputElement>(null)
  const timeRef   = useRef<HTMLSpanElement>(null)
  const rafRef    = useRef<number>(0)

  // Reset pause state when template changes
  useEffect(() => {
    animClock.paused = false
    setPaused(false)
  }, [animTemplate])

  // Clean up on unmount
  useEffect(() => {
    return () => { animClock.paused = false }
  }, [])

  // RAF loop — directly mutates DOM to avoid React re-render overhead
  useEffect(() => {
    const tick = () => {
      const e = animClock.elapsed
      if (sliderRef.current) sliderRef.current.value = String(e)
      if (timeRef.current) timeRef.current.textContent = `${formatTime(e)} / ${formatTime(totalDuration)}`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [totalDuration])

  const togglePause = () => {
    const next = !animClock.paused
    animClock.paused = next
    setPaused(next)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a1a] border-t border-white/5 flex-shrink-0">
      <button
        onClick={togglePause}
        className="text-white/60 hover:text-white transition-colors flex-shrink-0"
        title={paused ? 'Play' : 'Pause'}
      >
        {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </button>
      <input
        ref={sliderRef}
        type="range"
        min={0}
        max={totalDuration}
        step={0.01}
        defaultValue={0}
        onChange={(e) => { animClock.seekTo = Number(e.target.value) }}
        className="flex-1 accent-blue-500 cursor-pointer"
      />
      <span
        ref={timeRef}
        className="text-xs text-white/40 font-mono whitespace-nowrap tabular-nums flex-shrink-0"
      >
        0:00 / {formatTime(totalDuration)}
      </span>
    </div>
  )
}

import { useRef, useEffect } from 'react'
import { ANIM_TEMPLATE_MAP } from '@/lib/animTemplates'
import { animClock } from '@/lib/animClock'
import { evalBezier } from '@/lib/utils'
import type { AnimTemplate } from '@/types'

function computeTransform(template: AnimTemplate, elapsed: number): string {
  const kfs = template.keyframes
  const n = kfs.length
  const totalDuration = kfs.reduce((s, kf) => s + kf.duration, 0)
  const t = elapsed % totalDuration
  let segStart = 0
  for (let i = 0; i < n; i++) {
    const segEnd = segStart + kfs[i].duration
    if (t <= segEnd || i === n - 1) {
      const progress = kfs[i].duration > 0 ? Math.min((t - segStart) / kfs[i].duration, 1) : 1
      const [c1x, c1y, c2x, c2y] = kfs[i].easing
      const ep = evalBezier(c1x, c1y, c2x, c2y, progress)
      const next = kfs[(i + 1) % n]
      const cx = kfs[i].cam[0] + (next.cam[0] - kfs[i].cam[0]) * ep
      const cy = kfs[i].cam[1] + (next.cam[1] - kfs[i].cam[1]) * ep
      const cz = kfs[i].cam[2] + (next.cam[2] - kfs[i].cam[2]) * ep
      const roll = kfs[i].roll + (next.roll - kfs[i].roll) * ep
      const dist = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1
      const azimuth = Math.atan2(cx, cz) * (180 / Math.PI)
      const elevation = Math.atan2(cy, Math.sqrt(cx * cx + cz * cz)) * (180 / Math.PI)
      const scale = Math.min(Math.max(18 / dist, 0.32), 1.5)
      return `rotateY(${(-azimuth).toFixed(1)}deg) rotateX(${(elevation * 0.55).toFixed(1)}deg) rotateZ(${(-roll).toFixed(1)}deg) scale(${scale.toFixed(3)})`
    }
    segStart = segEnd
  }
  return ''
}

// Shared face styles
const FACE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
}

const BODY_DARK: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '13%',
  background: 'linear-gradient(145deg, #2b2b2b 0%, #181818 25%, #323232 50%, #141414 72%, #222 100%)',
  boxShadow: '0 8px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.14)',
}

const SHEEN: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '13%',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 30%, transparent 52%)',
  pointerEvents: 'none',
}

interface Props {
  templateId: string
  screenshot: string | null
}

export function AnimThumbnail({ templateId, screenshot }: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(performance.now())

  useEffect(() => {
    const template = ANIM_TEMPLATE_MAP[templateId]
    if (!template || !divRef.current) return
    let rafId: number
    const loop = () => {
      if (!divRef.current) return
      const elapsed = animClock.templateId === templateId
        ? animClock.elapsed
        : (performance.now() - startRef.current) / 1000
      divRef.current.style.transform = computeTransform(template, elapsed)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [templateId])

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ perspective: '280px', background: '#f0f0f2' }}
    >
      <div
        ref={divRef}
        style={{
          height: '83%',
          aspectRatio: '9 / 19.5',
          position: 'relative',
          flexShrink: 0,
          willChange: 'transform',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── FRONT FACE — screen side ───────────────────── */}
        <div style={FACE}>
          <div style={BODY_DARK} />
          <div style={SHEEN} />

          {/* Screen */}
          <div style={{
            position: 'absolute',
            inset: '3.5% 4% 3.5% 4%',
            borderRadius: '11%',
            background: '#080810',
            overflow: 'hidden',
          }}>
            {screenshot
              ? <img src={screenshot} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', background: '#111' }} />
            }
            {/* Glass reflection */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%)', pointerEvents: 'none' }} />
            {/* Dynamic island */}
            <div style={{ position: 'absolute', top: '3.2%', left: '50%', transform: 'translateX(-50%)', width: '30%', height: '4%', borderRadius: '9999px', background: '#000' }} />
          </div>

          {/* Side button */}
          <div style={{ position: 'absolute', right: '-1.5%', top: '22%', width: '2.5%', height: '10%', borderRadius: '1px 2px 2px 1px', background: 'linear-gradient(180deg, #383838 0%, #1e1e1e 50%, #2a2a2a 100%)', boxShadow: '1px 0 3px rgba(0,0,0,0.35)' }} />
          {/* Volume buttons */}
          {(['12%', '22%', '31%'] as const).map((top, i) => (
            <div key={i} style={{ position: 'absolute', left: '-1.5%', top, width: '2.5%', height: i === 0 ? '8%' : '7%', borderRadius: '2px 1px 1px 2px', background: 'linear-gradient(180deg, #383838 0%, #1e1e1e 50%, #2a2a2a 100%)', boxShadow: '-1px 0 3px rgba(0,0,0,0.35)' }} />
          ))}
        </div>

        {/* ── BACK FACE — camera side ────────────────────── */}
        <div style={{ ...FACE, transform: 'rotateY(180deg)' }}>
          <div style={BODY_DARK} />
          {/* Sheen from opposite direction on back */}
          <div style={{ ...SHEEN, background: 'linear-gradient(315deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.02) 30%, transparent 52%)' }} />

          {/* Camera module */}
          <div style={{
            position: 'absolute',
            top: '6%',
            left: '8%',
            width: '40%',
            height: '23%',
            borderRadius: '20%',
            background: 'linear-gradient(145deg, #242424 0%, #161616 60%, #202020 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            {/* 2×2 grid: 3 lenses + flash */}
            <div style={{ position: 'absolute', inset: '14%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '12%', padding: '6%' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 36% 36%, #1e1e38 0%, #06060e 60%, #111120 100%)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.06)',
                }} />
              ))}
              {/* Flash dot */}
              <div style={{ borderRadius: '35%', background: 'radial-gradient(circle at 42% 42%, #fffbe4 0%, #e8d068 55%, #a07820 100%)', boxShadow: '0 0 5px rgba(240,200,60,0.35)' }} />
            </div>
          </div>

          {/* Subtle Apple logo circle */}
          <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)', width: '18%', aspectRatio: '1 / 1', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </div>
  )
}

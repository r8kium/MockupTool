import type { TextLayer, TextAnimPreset } from '@/types'
import { evalBezier } from './utils'

export interface TextRenderState {
  visible: boolean
  opacity: number
  transform: string
  filter: string
  clipPath: string
}

const STILL: TextRenderState = { visible: true, opacity: 1, transform: 'none', filter: 'none', clipPath: 'none' }
const HIDDEN: TextRenderState = { visible: false, opacity: 0, transform: 'none', filter: 'none', clipPath: 'none' }

function ease(p: number, easing: [number,number,number,number]): number {
  return evalBezier(easing[0], easing[1], easing[2], easing[3], Math.max(0, Math.min(1, p)))
}

function buildState(
  preset: TextAnimPreset,
  rawProgress: number,
  easing: [number,number,number,number],
  entering: boolean,
  baseOpacity: number,
): TextRenderState {
  const p = ease(rawProgress, easing)
  const v = entering ? p : 1 - p   // 0→1 on enter, 1→0 on exit

  switch (preset) {
    case 'fade-in':
      return { visible: true, opacity: v * baseOpacity, transform: 'none', filter: 'none', clipPath: 'none' }
    case 'slide-up':
      return { visible: true, opacity: v * baseOpacity, transform: `translateY(${(1 - v) * 28}px)`, filter: 'none', clipPath: 'none' }
    case 'slide-down':
      return { visible: true, opacity: v * baseOpacity, transform: `translateY(${-(1 - v) * 28}px)`, filter: 'none', clipPath: 'none' }
    case 'slide-left':
      return { visible: true, opacity: v * baseOpacity, transform: `translateX(${(1 - v) * 28}px)`, filter: 'none', clipPath: 'none' }
    case 'slide-right':
      return { visible: true, opacity: v * baseOpacity, transform: `translateX(${-(1 - v) * 28}px)`, filter: 'none', clipPath: 'none' }
    case 'scale-up':
      return { visible: true, opacity: v * baseOpacity, transform: `scale(${0.82 + v * 0.18})`, filter: 'none', clipPath: 'none' }
    case 'blur-in':
      return { visible: true, opacity: v * baseOpacity, transform: 'none', filter: `blur(${(1 - v) * 10}px)`, clipPath: 'none' }
    case 'typewriter':
      return { visible: true, opacity: baseOpacity, transform: 'none', filter: 'none', clipPath: `inset(0 ${(1 - v) * 100}% 0 0)` }
    default:
      return { ...STILL, opacity: baseOpacity }
  }
}

export function getTextLayerState(
  layer: TextLayer,
  t: number,
  totalDuration: number,
): TextRenderState {
  if (!layer.visible) return HIDDEN

  const effectiveDuration = layer.duration < 0 ? Math.max(totalDuration - layer.startTime, 0.001) : layer.duration
  const endTime = layer.startTime + effectiveDuration

  if (t < layer.startTime || t > endTime) return HIDDEN

  const elapsed = t - layer.startTime

  // Entering phase
  if (layer.enterAnim !== 'none' && elapsed < layer.enterDuration) {
    return buildState(layer.enterAnim, elapsed / layer.enterDuration, layer.enterEasing, true, layer.opacity)
  }

  // Exiting phase
  const exitStart = effectiveDuration - layer.exitDuration
  if (layer.exitAnim !== 'none' && elapsed >= exitStart) {
    return buildState(layer.exitAnim, (elapsed - exitStart) / layer.exitDuration, layer.exitEasing, false, layer.opacity)
  }

  return { ...STILL, opacity: layer.opacity }
}

export const ANIM_PRESET_LABELS: Record<TextAnimPreset, string> = {
  'none':        'None',
  'fade-in':     'Fade',
  'slide-up':    'Slide Up',
  'slide-down':  'Slide Down',
  'slide-left':  'Slide Left',
  'slide-right': 'Slide Right',
  'scale-up':    'Scale Up',
  'blur-in':     'Blur In',
  'typewriter':  'Typewriter',
}

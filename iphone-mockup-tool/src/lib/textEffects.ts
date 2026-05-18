import type { TextAnimPreset } from '@/types'

export interface TextEffect {
  id: string
  name: string
  emoji: string
  description: string
  enter: { anim: TextAnimPreset; duration: number; easing: [number,number,number,number] }
  exit:  { anim: TextAnimPreset; duration: number; easing: [number,number,number,number] }
}

export const TEXT_EFFECTS: TextEffect[] = [
  {
    id: 'instant',
    name: 'Instant',
    emoji: '⚡',
    description: 'No animation',
    enter: { anim: 'none',       duration: 0,   easing: [0,0,1,1] },
    exit:  { anim: 'none',       duration: 0,   easing: [0,0,1,1] },
  },
  {
    id: 'fade-up',
    name: 'Fade Up',
    emoji: '↑',
    description: 'Floats upward as it fades in',
    enter: { anim: 'slide-up',   duration: 0.55, easing: [0.16,1,0.3,1] },
    exit:  { anim: 'fade-in',    duration: 0.35, easing: [0.4,0,1,1] },
  },
  {
    id: 'bold-drop',
    name: 'Bold Drop',
    emoji: '▼',
    description: 'Scales in with impact',
    enter: { anim: 'scale-up',   duration: 0.4,  easing: [0.34,1.56,0.64,1] },
    exit:  { anim: 'fade-in',    duration: 0.25, easing: [0.4,0,1,1] },
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    emoji: '▶',
    description: 'Types across character by character',
    enter: { anim: 'typewriter', duration: 1.2,  easing: [0,0,1,1] },
    exit:  { anim: 'fade-in',    duration: 0.3,  easing: [0.4,0,1,1] },
  },
  {
    id: 'blur-reveal',
    name: 'Blur Reveal',
    emoji: '◎',
    description: 'Sharpens in from a blur',
    enter: { anim: 'blur-in',    duration: 0.7,  easing: [0.25,0.46,0.45,0.94] },
    exit:  { anim: 'blur-in',    duration: 0.4,  easing: [0.4,0,1,1] },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    emoji: '🎬',
    description: 'Slides in from the left, cinematic pace',
    enter: { anim: 'slide-right', duration: 0.6, easing: [0.16,1,0.3,1] },
    exit:  { anim: 'slide-left',  duration: 0.4, easing: [0.4,0,1,1] },
  },
  {
    id: 'soft-float',
    name: 'Soft Float',
    emoji: '~',
    description: 'Gentle fade with a subtle rise',
    enter: { anim: 'slide-up',   duration: 0.9,  easing: [0.25,0.46,0.45,0.94] },
    exit:  { anim: 'fade-in',    duration: 0.5,  easing: [0.4,0,1,1] },
  },
  {
    id: 'snap-in',
    name: 'Snap In',
    emoji: '✦',
    description: 'Quick slide up, snappy feel',
    enter: { anim: 'slide-up',   duration: 0.25, easing: [0.4,0,0.2,1] },
    exit:  { anim: 'slide-down', duration: 0.2,  easing: [0.4,0,1,1] },
  },
]

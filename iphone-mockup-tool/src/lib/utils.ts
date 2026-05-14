import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target!.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function evalBezier(c1x: number, c1y: number, c2x: number, c2y: number, t: number): number {
  let s0 = 0, s1 = 1
  for (let i = 0; i < 12; i++) {
    const sm = (s0 + s1) / 2
    const bx = 3 * sm * (1 - sm) * (1 - sm) * c1x + 3 * sm * sm * (1 - sm) * c2x + sm * sm * sm
    if (bx < t) s0 = sm; else s1 = sm
  }
  const s = (s0 + s1) / 2
  return 3 * s * (1 - s) * (1 - s) * c1y + 3 * s * s * (1 - s) * c2y + s * s * s
}

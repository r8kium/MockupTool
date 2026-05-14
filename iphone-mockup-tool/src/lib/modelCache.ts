import { useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export type ModelStatus = 'idle' | 'loading' | 'loaded'

const statusMap = new Map<string, ModelStatus>()
let version = 0
const listeners = new Set<() => void>()

function bump() {
  version++
  listeners.forEach(fn => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function markLoaded(url: string) {
  if (statusMap.get(url) !== 'loaded') {
    statusMap.set(url, 'loaded')
    bump()
  }
}

// Catch models completing via preload (no DeviceModel renders them)
const mgr = THREE.DefaultLoadingManager
const _onProgress = mgr.onProgress?.bind(mgr)
mgr.onProgress = (url: string, loaded: number, total: number) => {
  _onProgress?.(url, loaded, total)
  if (url.endsWith('.gltf') || url.endsWith('.glb')) markLoaded(url)
}

export function preloadModel(url: string) {
  if (statusMap.get(url) === 'loaded') return
  statusMap.set(url, 'loading')
  bump()
  useGLTF.preload(url)
}

export function preloadAll(urls: string[]) {
  urls.forEach(preloadModel)
}

export function useModelStatus(url: string): ModelStatus {
  useSyncExternalStore(subscribe, () => version)
  return statusMap.get(url) ?? 'idle'
}

export function useLoadedCount(urls: string[]): number {
  useSyncExternalStore(subscribe, () => version)
  return urls.filter(u => statusMap.get(u) === 'loaded').length
}

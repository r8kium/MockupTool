import { useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export type ModelStatus = 'idle' | 'loading' | 'loaded' | 'error'

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

export function markError(url: string) {
  statusMap.set(url, 'error')
  bump()
}

// Catch models completing or erroring via preload
const mgr = THREE.DefaultLoadingManager
const _onProgress = mgr.onProgress?.bind(mgr)
const _onError    = mgr.onError?.bind(mgr)

mgr.onProgress = (url: string, loaded: number, total: number) => {
  _onProgress?.(url, loaded, total)
  if (url.endsWith('.gltf') || url.endsWith('.glb')) markLoaded(url)
}

mgr.onError = (url: string) => {
  _onError?.(url)
  if (url.endsWith('.gltf') || url.endsWith('.glb')) markError(url)
}

export function preloadModel(url: string) {
  const s = statusMap.get(url)
  if (s === 'loaded' || s === 'loading') return
  statusMap.set(url, 'loading')
  bump()
  useGLTF.preload(url)
}

export function preloadAll(urls: string[]) {
  urls.forEach(preloadModel)
}

export function retryModel(url: string) {
  statusMap.delete(url)
  preloadModel(url)
}

export function useModelStatus(url: string): ModelStatus {
  useSyncExternalStore(subscribe, () => version)
  return statusMap.get(url) ?? 'idle'
}

export function useLoadedCount(urls: string[]): number {
  useSyncExternalStore(subscribe, () => version)
  return urls.filter(u => statusMap.get(u) === 'loaded').length
}

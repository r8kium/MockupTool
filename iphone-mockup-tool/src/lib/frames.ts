import type { DeviceModel, DeviceId } from '@/types'

export const DEVICE_MODELS: Record<DeviceId, DeviceModel> = {
  'iphone-16-pro': {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    gltfPath: '/models/iPhone 16 Pro.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'natural', label: 'Natural Titanium', hex: '#c8b89a' },
      { id: 'black', label: 'Black Titanium', hex: '#2c2c2e' },
      { id: 'white', label: 'White Titanium', hex: '#e8e4de' },
      { id: 'desert', label: 'Desert Titanium', hex: '#c5a882' },
    ],
  },
  'iphone-15-pro': {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    gltfPath: '/models/iPhone 15 Pro.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'natural', label: 'Natural Titanium', hex: '#c8b89a' },
      { id: 'black', label: 'Black Titanium', hex: '#2c2c2e' },
      { id: 'white', label: 'White Titanium', hex: '#e8e4de' },
      { id: 'blue', label: 'Blue Titanium', hex: '#4a6b8c' },
    ],
  },
  'iphone-15-pro-max': {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    gltfPath: '/models/iPhone 15 Pro Max.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'natural', label: 'Natural Titanium', hex: '#c8b89a' },
      { id: 'black', label: 'Black Titanium', hex: '#2c2c2e' },
      { id: 'white', label: 'White Titanium', hex: '#e8e4de' },
      { id: 'blue', label: 'Blue Titanium', hex: '#4a6b8c' },
    ],
  },
  'iphone-15': {
    id: 'iphone-15',
    name: 'iPhone 15',
    gltfPath: '/models/iPhone 15.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'black', label: 'Black', hex: '#1c1c1e' },
      { id: 'blue', label: 'Blue', hex: '#4a90a4' },
      { id: 'green', label: 'Green', hex: '#5a8a6a' },
      { id: 'yellow', label: 'Yellow', hex: '#f5e066' },
      { id: 'pink', label: 'Pink', hex: '#f4a7b9' },
    ],
  },
  'iphone-15-plus': {
    id: 'iphone-15-plus',
    name: 'iPhone 15 Plus',
    gltfPath: '/models/iPhone 15 Plus.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'black', label: 'Black', hex: '#1c1c1e' },
      { id: 'blue', label: 'Blue', hex: '#4a90a4' },
      { id: 'green', label: 'Green', hex: '#5a8a6a' },
      { id: 'yellow', label: 'Yellow', hex: '#f5e066' },
      { id: 'pink', label: 'Pink', hex: '#f4a7b9' },
    ],
  },
  'iphone-14-pro': {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    gltfPath: '/models/iPhone 14 Pro.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'space', label: 'Space Black', hex: '#1c1c1e' },
      { id: 'silver', label: 'Silver', hex: '#e8e4de' },
      { id: 'gold', label: 'Gold', hex: '#f5e6c8' },
      { id: 'purple', label: 'Deep Purple', hex: '#4a3d6b' },
    ],
  },
  'iphone-13-pro-max': {
    id: 'iphone-13-pro-max',
    name: 'iPhone 13 Pro Max',
    gltfPath: '/models/iPhone 13 Pro Max.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'graphite', label: 'Graphite', hex: '#3a3a3c' },
      { id: 'gold', label: 'Gold', hex: '#f5e6c8' },
      { id: 'silver', label: 'Silver', hex: '#e8e4de' },
      { id: 'sierra', label: 'Sierra Blue', hex: '#8fa8c0' },
      { id: 'alpine', label: 'Alpine Green', hex: '#4a7a5a' },
    ],
  },
  'iphone-13': {
    id: 'iphone-13',
    name: 'iPhone 13',
    gltfPath: '/models/iPhone 13.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'midnight', label: 'Midnight', hex: '#1c1c1e' },
      { id: 'starlight', label: 'Starlight', hex: '#f5f0e8' },
      { id: 'blue', label: 'Blue', hex: '#2d5a8e' },
      { id: 'pink', label: 'Pink', hex: '#f4a7b9' },
      { id: 'green', label: 'Green', hex: '#4a7a5a' },
      { id: 'red', label: 'Red', hex: '#e02020' },
    ],
  },
  'iphone-13-mini': {
    id: 'iphone-13-mini',
    name: 'iPhone 13 mini',
    gltfPath: '/models/iPhone 13 Mini.gltf',
    screenAspect: 19.5 / 9,
    colors: [
      { id: 'midnight', label: 'Midnight', hex: '#1c1c1e' },
      { id: 'starlight', label: 'Starlight', hex: '#f5f0e8' },
      { id: 'blue', label: 'Blue', hex: '#2d5a8e' },
      { id: 'pink', label: 'Pink', hex: '#f4a7b9' },
      { id: 'green', label: 'Green', hex: '#4a7a5a' },
      { id: 'red', label: 'Red', hex: '#e02020' },
    ],
  },
}

export const DEVICE_LIST: DeviceModel[] = Object.values(DEVICE_MODELS)

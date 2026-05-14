# Mockup Tool — AI Context File

> Read this entire file before touching any code. It captures the full architecture, current state, planned work, and constraints.

---

## Project Goal

Browser-based 3D device mockup tool. Studio-quality renders and animations, entirely client-side — zero server cost, shareable via link. Usable by designers and non-technical marketers alike.

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Bundler | Vite 6 |
| UI | React 19 + TypeScript |
| Styling | Tailwind v4 (CSS-first, no tailwind.config.js) |
| State | Zustand (with persist middleware) |
| 3D | React Three Fiber + Three.js + @react-three/drei |
| Icons | Lucide React |

Dev server: `cd iphone-mockup-tool && npm run dev` → http://localhost:5173

Build: `npm run build` — must pass `npx tsc --noEmit` cleanly before committing.

---

## Repository Layout

```
MockupTool/                        ← git root
├── CLAUDE.md                      ← this file
└── iphone-mockup-tool/            ← the web app
    ├── public/
    │   ├── models/                ← 56 GLTF device models (311 MB total)
    │   ├── thumbnails/            ← device thumbnail PNGs
    │   └── backgrounds/           ← background preset images
    └── src/
        ├── components/
        │   ├── ThreeCanvas.tsx    ← main 3D renderer (critical file)
        │   ├── AnimSection.tsx    ← shared animation template picker grid
        │   ├── SeekBar.tsx        ← play/pause + scrub bar below canvas
        │   ├── RightPanel.tsx     ← device editor controls sidebar
        │   └── AnimatedBackground.tsx
        ├── lib/
        │   ├── frames.ts          ← device registry (DEVICE_MODELS, 53 entries)
        │   ├── compositions.ts    ← scene templates (15 multi-device compositions)
        │   ├── animTemplates.ts   ← animation templates (16 camera paths)
        │   ├── animClock.ts       ← shared animation clock singleton
        │   ├── backgrounds.ts     ← CSS background presets (PRESET_BACKGROUNDS)
        │   ├── animBackgrounds.ts ← animated background definitions
        │   ├── environments.ts    ← HDRI environment presets (10 entries)
        │   ├── exportMp4.ts       ← WebCodecs + mp4-muxer offline render pipeline
        │   ├── scenes.ts          ← scene helper utilities
        │   └── utils.ts           ← readFileAsDataUrl, evalBezier, cn
        ├── store/
        │   └── useEditorStore.ts  ← Zustand store (EditorState + EditorActions)
        ├── types/
        │   └── index.ts           ← all TypeScript types
        └── views/
            ├── Editor.tsx         ← single-device editor view
            ├── SceneEditor.tsx    ← multi-device scene editor view
            └── DeviceBrowser.tsx  ← device/scene selection grid
```

---

## Core Architecture

### Three.js Rendering (ThreeCanvas.tsx)

- `ThreeCanvas` is a forwarded-ref component accepting: `state`, `canvasRef`, `animTemplate`, `sceneTemplate`, `slotScreenshots`, `onSlotScreenshotUpload`, `onScreenshotUpload`
- `DeviceModel` component: loads GLTF via `useGLTF`, clones scene, applies materials per mesh name
- Screen mesh detection: `SCREEN_MESHES = new Set(['Screen', 'Screen_Top', 'Screen_Inside'])` — exact name match
- Screenshot texture: applied as `map` on `MeshBasicMaterial` of screen meshes only
- Body color: resolved from `state.colorId` + `state.customColorHex`; applied to all non-screen, non-glass meshes
- `CameraController`: orbit controls for manual angle, sets `animClock.templateId = null` on mount
- `AnimatedCamera`: drives camera via keyframe interpolation each `useFrame`, writes to `animClock`
- `SceneBg`: sets `scene.background` for solid color; CSS handles all other BG types
- `SceneEnvironment`: loads HDRI preset via drei `<Environment>`, replaces flat `StudioLighting` when active

**Mesh tag:** 3D model files contain a metadata node identified by `HIDDEN_MESH_TAG` — hidden during scene traversal.

### Zustand Store (useEditorStore.ts)

```typescript
EditorState {
  screenshot: string | null
  deviceId: DeviceId
  colorId: string
  customColorHex: string | null
  background: BackgroundConfig
  shadow: boolean
  cameraAngle: 'front' | 'isometric' | 'side'
}

// Extended in FullState:
shadowPreset: 'none' | 'soft' | 'long' | 'short'
animTemplateId: string | null
environmentId: string | null
```

Key actions: `setDevice`, `setColor`, `setCustomColor`, `setAnimTemplate`, `setEnvironment`, `setBackground`, `setShadowPreset`

`setColor(id)` clears `customColorHex`. `setCustomColor(hex)` sets `colorId = 'custom'`.

Store key: `mockup-editor-v3` (bump version when making breaking schema changes).

### Animation Clock (animClock.ts)

```typescript
export const animClock = {
  templateId: null as string | null,
  elapsed: 0,
  paused: false,
  seekTo: null as number | null,
}
```

Written every frame by `AnimatedCamera.useFrame`. Read by `AnimThumbnail` and `SeekBar` RAF loops. When no animation is active, `templateId = null`.

### SeekBar (SeekBar.tsx)

Play/pause toggle + scrubable range input. Rendered below the canvas when `animTemplate` is set. Uses its own RAF loop — directly mutates DOM to avoid React re-render overhead per frame.

### AnimThumbnail (AnimThumbnail.tsx)

CSS 3D card with two faces. Each thumbnail runs its own RAF loop, directly mutating `div.style.transform`. Active template reads `animClock.elapsed`; inactive templates use local elapsed time.

`computeTransform(template, elapsed)` → `rotateY(-azimuth) rotateX(elevation×0.55) rotateZ(-roll) scale(18/dist)`

### Background System (backgrounds.ts)

`BackgroundType = 'transparent' | 'solid' | 'gradient' | 'image' | 'preset' | 'animated'`

Preset backgrounds are CSS-only radial-gradient blobs. `getPresetCss(id)` returns the CSS string.

### Environment System (environments.ts)

10 HDRI presets loaded from the `@react-three/drei` CDN. When an environment is active, `StudioLighting` is replaced by `SceneEnvironment` (IBL + one shadow-casting directional). `scene.background` is unaffected — background system is orthogonal.

### Color System (RightPanel.tsx)

Device colors → divider → 12 Apple color presets → native `<input type="color">` + hex text input.

### Export Pipeline (exportMp4.ts)

**PNG:** `gl.domElement.toDataURL('image/png')` via `ThreeCanvasRef.exportPNG()`

**MP4:** Offline render using WebCodecs + mp4-muxer. Pauses the live clock, computes camera position directly per frame (bypasses `useFrame`), calls `gl.render()` synchronously, creates `VideoFrame` from canvas, encodes to H.264. Yields every 10 frames for UI responsiveness. Requires Chrome 94+ (WebCodecs API).

`ThreeCanvasRef.getThreeContext()` exposes `{ gl, scene, camera }` for the export pipeline.

---

## Device Registry (frames.ts) — 53 Devices

### iPhone (20)
`iphone-17-pro-max`, `iphone-16-pro-max`, `iphone-16-pro`, `iphone-16-plus`, `iphone-16`, `iphone-15-pro`, `iphone-15-pro-max`, `iphone-15`, `iphone-15-plus`, `iphone-14-pro`, `iphone-13-pro-max`, `iphone-13`, `iphone-13-mini`, `iphone-12-pro`, `iphone-12-pro-bezel-less`, `iphone-12-2020`, `iphone-11-pro`, `iphone-8`, `9-pro`, `pro-max-notchless`

### iPad (6)
`ipad-pro-11`, `ipad-m1-2021`, `ipad-mini-6`, `ipad-2021-magic-keyboard`, `generic-tablet`, `infinity-tablet`

### Mac (11)
`macbook-pro-m3-16`, `macbook-pro-m3-14`, `macbook-pro-m1-16`, `macbook-air-m2-15`, `macbook-air-m2-13`, `macbook-air-m1`, `macbook-16`, `macbook-air-2018`, `imac-24`, `xdr-2019`, `surface-laptop-4`

### Watch (4)
`watch-ultra-2`, `watch-series-7`, `watch-series-6`, `apple-watch-4`

### Android (5)
`galaxy-s25-plus`, `galaxy-s25`, `samsung-s21`, `pixel-4a`, `galaxy-s9`

### Generic (7)
`generic-phone-thin-bezel`, `glass-phone`, `phone-display`, `clean-phone`, `flow-3`, `frame-tv`, `1-device`

**Scale target:** `modelScale ≈ 10 / max(bounding_box_dims)`

**Camera presets in frames.ts:** `MAC_CAM`, `TABLET_CAM`, `WATCH_CAM`, or custom `{ front, isometric, side }` each as `[x, y, z]`

---

## Scene Templates (compositions.ts) — 15 Scenes

`phone-x2`, `phone-on-macbook`, `phone-beside-macbook`, `phone-macbook-watch`, `macbook-ipad`, `iphone-12-double`, `iphone-12-triple`, `cleanphone-x2`, `apple-device-family`, `family-phone-on-macbook`, `family-iphone-down`, `family-iphone-float`, `family-iphone-out`, `family-iphone-up`, `family-iphone-up45`

`SceneSlot`: `{ deviceId, position: [x,y,z], rotation: [x,y,z] (degrees), scaleMul?, label }`

---

## Animation Templates (animTemplates.ts) — 16 Templates

**Ambient (2):** `float`, `tilt`

**Cinematic (3):** `dolly-in`, `dolly-out`, `orbit`

**Studio (11):** `top-turn`, `bottom-turn`, `flip-in`, `flip-up`, `pan-across`, `hover`, `slide-in`, `dangle`, `hoist-down`, `edging`, `slide-in-top`

Each keyframe: `{ cam: [x,y,z], roll: number, duration: seconds, easing: [c1x,c1y,c2x,c2y] }`

`evalBezier(c1x, c1y, c2x, c2y, t)` in `utils.ts` — 12-iteration binary search for cubic bezier.

---

## Adding a New Device

1. Obtain a GLTF model and place it in `public/models/device-id.gltf`
2. Add a thumbnail PNG at `public/thumbnails/device-id.png`
3. Add `'device-id'` to the `DeviceId` union in `src/types/index.ts`
4. Register in `src/lib/frames.ts`: `id`, `name`, `category`, `gltfPath`, `thumbnailPath`, `screenAspect`, `modelScale`, `colors`, `camPresets?`
5. Target `modelScale ≈ 10 / max(bounding_box_dims)` for consistent framing

Screen mesh naming: the GLTF's screen mesh must be named `Screen`, `Screen_Top`, or `Screen_Inside` for the screenshot texture to apply. Rename in the GLTF JSON if needed.

---

## Planned Work

### 1 — Per-device object animation
Currently all animation is camera-only. Adding position/scale/opacity keyframes per slot unlocks "fly-in" and "reveal" style shots — the primary gap vs. native desktop tools.

### 2 — Export size presets
App Store (1290×2796, 1242×2208), TikTok/Stories (1080×1920), OG image (1200×630). Resize renderer before recording, restore after.

### 3 — Shareable URL
Encode full editor state in URL hash. Zero server required.

### 4 — Figma plugin
Import design frames directly from Figma into device screens.

---

## Known Constraints

- **Model sizes:** 311 MB total for 56 models — exceeds Vercel 100 MB limit. Requires Cloudflare R2 or similar CDN for deployment
- **GLTF format:** Models are `.gltf` (JSON + embedded base64), not `.glb` — larger than necessary. Draco + KTX2 compression could reduce to ~80–90 MB
- **MP4 export:** Requires Chrome 94+ (WebCodecs API). No Safari fallback
- **Environment presets:** Loaded from `@react-three/drei` CDN — requires network access
- **`macbook-16.gltf`:** Broken extraction (flat dims). Use `macbook-pro-m3-16` instead. Kept in models/ for reference

---

## Git Rules

- **Never add `Co-Authored-By: Claude` trailer** to commit messages
- Commit messages: conventional format (`feat:`, `fix:`, `refactor:`, etc.)
- No force-push to main

# MockupTool — AI Context File

> **For any AI assistant picking this up:** Read this entire file before touching any code. It captures every architectural decision, current state, planned work, and constraint. The project has evolved significantly from early commits — trust this file over old commit messages.

---

## Project Goal

Browser-based 3D device mockup tool with Rotato-quality renders, zero server cost, shareable via link. Built for personal use + small team. Target: 85% of Rotato's visual quality entirely client-side.

**Not a 2D canvas tool.** Early commits (May 1–2) show a 2D PNG-compositing approach — that was completely replaced. The app is now a full Three.js 3D viewer.

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
| Routing | None — three views managed by `useState` in App.tsx |

Dev server: `cd iphone-mockup-tool && npm run dev` → http://localhost:5173

Build: `npm run build` — must pass `npx tsc --noEmit` cleanly before committing.

---

## Repository Layout

```
MockupTool/                        ← git root
├── CLAUDE.md                      ← this file
├── rotato_extract.py              ← extracts GLTF from .rotato device files
├── analyze_gltf.py                ← inspect mesh bounds/names in a GLTF
├── scene_layout_extract.py        ← extract device positions from multi-device .rotato files
├── iphone-mockup-tool-plan.md     ← original planning doc (historical, mostly stale)
└── iphone-mockup-tool/            ← the web app
    ├── public/
    │   ├── models/                ← 56 GLTF device models (311 MB total)
    │   ├── thumbnails/            ← device thumbnail PNGs
    │   └── backgrounds/           ← background preset images (if any)
    └── src/
        ├── components/
        │   ├── ThreeCanvas.tsx    ← main 3D renderer (critical file)
        │   ├── AnimThumbnail.tsx  ← CSS 3D animated preview cards
        │   ├── RightPanel.tsx     ← device editor controls sidebar
        │   └── AnimatedBackground.tsx
        ├── lib/
        │   ├── frames.ts          ← device registry (DEVICE_MODELS, 53 entries)
        │   ├── compositions.ts    ← scene templates (15 multi-device compositions)
        │   ├── animTemplates.ts   ← animation templates (16 camera paths)
        │   ├── animClock.ts       ← shared animation clock singleton
        │   ├── backgrounds.ts     ← CSS background presets (PRESET_BACKGROUNDS)
        │   ├── animBackgrounds.ts ← animated background definitions
        │   ├── scenes.ts          ← scene helper utilities
        │   └── utils.ts           ← readFileAsDataUrl, evalBezier
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
- Screenshot texture: applied as `map` on `MeshStandardMaterial` of screen meshes only
- Body color: resolved from `state.colorId` + `state.customColorHex`; applied to all non-screen, non-glass meshes
- `CameraController`: orbit controls for manual angle, sets `animClock.templateId = null` on mount
- `AnimatedCamera`: drives camera via keyframe interpolation each `useFrame`, writes to `animClock`
- `SceneBg`: sets `scene.background` for solid color; CSS handles all other BG types

### Zustand Store (useEditorStore.ts)

```typescript
EditorState {
  screenshot: string | null
  deviceId: DeviceId
  colorId: string
  customColorHex: string | null   // null = use device preset color
  background: BackgroundConfig
  shadow: boolean
  cameraAngle: 'front' | 'isometric' | 'side'
}

// Plus on FullState:
shadowPreset: 'none' | 'soft' | 'long' | 'short'
animTemplateId: string | null
```

Key actions: `setDevice`, `setColor`, `setCustomColor`, `setAnimTemplate`, `setBackground`, `setShadow`

`setColor(id)` clears `customColorHex`. `setCustomColor(hex)` sets `colorId = 'custom'`.

### Animation Clock (animClock.ts)

```typescript
export const animClock = {
  templateId: null as string | null,
  elapsed: 0,
}
```

Written every frame by `AnimatedCamera.useFrame`. Read by `AnimThumbnail` RAF loops. When no animation is active, `templateId = null` (set by `CameraController.onMount`).

### AnimThumbnail (AnimThumbnail.tsx)

CSS 3D card with `transformStyle: preserve-3d` and two faces (front = screen, back = camera module). Each thumbnail runs its own `requestAnimationFrame` loop, directly mutating `div.style.transform` — bypasses React re-renders entirely. Active template reads `animClock.elapsed` for sync; inactive templates use local `(performance.now() - startRef) / 1000`.

`computeTransform(template, elapsed)` → `rotateY(-azimuth) rotateX(elevation×0.55) rotateZ(-roll) scale(18/dist)`

Background: `#f0f0f2`. Phone body: dark charcoal (`linear-gradient(145deg, #2b2b2b...)`). Always dark regardless of device color selection.

### Background System (backgrounds.ts)

`BackgroundType = 'transparent' | 'solid' | 'gradient' | 'image' | 'preset'`

`BackgroundConfig` adds `presetId?: string`. Preset backgrounds are CSS-only radial-gradient blobs (Raycast-style mesh gradients). `getPresetCss(id)` returns the CSS string. `ThreeCanvas` applies preset CSS via inline style on the canvas wrapper.

### Color System (RightPanel.tsx)

Device colors → divider → 12 Apple color presets (Titanium, Midnight, Starlight, Silver, Gold, Rose Gold, Deep Purple, Pacific Blue, Alpine Green, Product Red, Yellow, Space Gray) → native `<input type="color">` + hex text input.

Apple preset click: `state.setCustomColor(hex)`. Custom hex committed on blur or Enter if valid 6-digit hex.

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

**Scale target:** `modelScale ≈ 10 / max(bounding_box_dims)` — keeps largest dimension ~10 scene units.

**Camera presets available in frames.ts:** `MAC_CAM`, `TABLET_CAM`, `WATCH_CAM`, or custom `{ front, isometric, side }` each as `[x, y, z]`.

---

## Scene Templates (compositions.ts) — 15 Scenes

Hand-crafted: `phone-x2`, `phone-on-macbook`, `phone-beside-macbook`, `phone-macbook-watch`, `macbook-ipad`

Rotato-derived positions: `iphone-12-double`, `iphone-12-triple`, `cleanphone-x2`, `apple-device-family`

Family scenes (approximate, not derivable from data): `family-phone-on-macbook`, `family-iphone-down`, `family-iphone-float`, `family-iphone-out`, `family-iphone-up`, `family-iphone-up45`

SceneSlot shape: `{ deviceId, position: [x,y,z], rotation: [x,y,z] (degrees), scaleMul?, label }`

---

## Animation Templates (animTemplates.ts) — 16 Templates

Hand-crafted (5): `float`, `tilt`, `dolly-in`, `dolly-out`, `orbit`

Rotato-extracted (11): `01-topturn` (Top Turn), `02-bottom-turn` (Bottom Turn), `03-flip-in` (Flip In), `04-flip-up` (Flip Up), `05-pan-across` (Pan Across), `06-hover` (Hover), `08-slide-in` (Slide In), `09-dangle` (Dangle), `10-hoist-down` (Hoist Down), `11-edging` (Edging), `12-slide-in` (Slide In Top)

Each keyframe: `{ cam: [x,y,z], roll: number, duration: seconds, easing: [c1x,c1y,c2x,c2y] }`

`evalBezier(c1x, c1y, c2x, c2y, t)` is in `utils.ts` — 12-iteration binary search for cubic bezier parameter.

Animation loops by default: interpolation wraps from last keyframe back to first.

---

## Export (current)

`ThreeCanvasRef.exportPNG()` → `gl.domElement.toDataURL('image/png')` — available on both `Editor` and `SceneEditor` via `canvasRef`.

---

## Planned Work (next session, confirmed with user)

### 1 — Animation Templates on Scenes
- `SceneEditor` currently passes no `animTemplate` to `ThreeCanvas` — wire up `animTemplateId` from store
- Add shared `AnimSection` component (extracted from `RightPanel`) to `SceneEditor` sidebar
- No 3D logic changes needed — `AnimatedCamera` is camera-centric, works for multi-device scenes

### 2 — Seek Bar
Extend `animClock` with `paused: boolean` and `seekTo: number | null`.

`AnimatedCamera.useFrame` modification:
```typescript
if (animClock.seekTo !== null) { elapsedRef.current = animClock.seekTo; animClock.seekTo = null }
if (!animClock.paused) elapsedRef.current += delta
animClock.elapsed = elapsedRef.current % totalDuration
```

New `SeekBar` component below canvas: play/pause toggle + scrubable `<input type="range" min=0 max=totalDuration>` + elapsed/total display. Uses own RAF loop reading `animClock.elapsed`. Visible only when `animTemplateId` is set.

### 3 — Export (Image + Video)

**Export Frame:** existing `exportPNG()` — add resolution multiplier option.

**Export Animation (MP4):** Use **WebCodecs API + mp4-muxer** (not MediaRecorder — frame-perfect, true MP4, 2K/4K ready).

```
npm install mp4-muxer
```

Offline render approach (frame-perfect, device-speed independent):
1. Pause animation, reset to t=0
2. For each frame i at 30fps (0 → totalDuration × 30):
   a. Set `animClock.seekTo = i / 30`
   b. Force `gl.render(scene, camera)` once
   c. `new VideoFrame(canvas, { timestamp: i/30 * 1e6 })` → `VideoEncoder.encode()`
3. Flush encoder → `muxer.finalize()` → Blob → download `.mp4`

Export button becomes a dropdown: **Export Frame** (PNG) / **Export Animation** (MP4).

Non-looping: animation plays exactly once from 0 → totalDuration.

Future 2K/4K: resize renderer before recording, restore after — architecture already supports this.

---

## Rotato Extraction Pipeline

### Single device
```bash
python3 rotato_extract.py "~/Library/Application Support/Rotato/Scenes/Device.rotato" "iphone-mockup-tool/public/models/device-id.gltf"
# Batch:
python3 rotato_extract.py --batch "/path/to/Scenes/" "iphone-mockup-tool/public/models/"
```

### How it works
1. `compression_tool -decode -i file.rotato -o decoded -a lzfse` — decompress LZFSE
2. Parse NSKeyedArchive plist with Python `plistlib`
3. Traverse full `SCNNode` hierarchy from `SCNScene.rootNode`
4. Per-node transform: translation-only OR full-TRS (auto-detected per model)
5. Extract geometry, apply world transforms, emit GLTF 2.0 with base64 buffer

### Transform mode (critical for Mac models)

**Translation-only** (MacBook Pro M3 14"/16"): geometry authored upright, skip all rotations. Hinge pos magnitude ≥ 1 AND first geometry child pos < Hinge pos × 0.5.

**Full-TRS** (M1 Pro, Air M1/M2, iMac): geometry flat, Hinge rotation stands screen up. Apply all node transforms.

Exception: in translation-only mode, non-animated nodes with pos magnitude ≥ 1 unit still get full TRS (e.g. `Matte_Top` hinge cover strip on M3 Pro 16").

### Extraction failures (skip these)
- `iPhone 14 Pro Max.rotato` — different LZFSE variant, plist parse fails
- `Galaxy Note 20 Ultra.rotato` — same issue
- `Simple Universal.rotato` — no geometry

### After extracting: screen mesh check
If extracted GLTF has `Geometry_XXX` mesh names, identify flattest mesh (largest face, thinnest depth) and rename to `Screen` in the GLTF JSON. `ThreeCanvas` won't apply the screenshot texture otherwise.

### Multi-device scene extraction
Multi-device `.rotato` files use `Rotato.RotatoState` root (not `SCNScene`). Positions at `customScene → scene.custom → rootNode → children`. Each child has `position: bytes(12)` (3 floats) and `rotation: bytes(16)` (axis-angle: ax, ay, az, angle_radians).

Convert to Three.js: `position = rotato_pos × modelScale`. For rotation: convert axis-angle → quaternion → Euler XYZ. iPhone 12 Pro needs base Y+180° (older extraction didn't bake RotationNode); newer models (iPhone 16+, MacBooks) base Y=0.

---

## How to Add a New Device

1. Extract GLTF: `python3 rotato_extract.py "Scenes/Device.rotato" "iphone-mockup-tool/public/models/device-id.gltf"`
2. Copy thumbnail: `~/Library/Application Support/Rotato/Scenes/Device Name.png` → `public/thumbnails/device-id.png`
3. Add `device-id` to `DeviceId` union in `src/types/index.ts`
4. Register in `src/lib/frames.ts`: `id`, `name`, `category`, `gltfPath`, `thumbnailPath`, `screenAspect`, `modelScale`, `colors`, `camPresets?`
5. Verify bounds: `python3 analyze_gltf.py public/models/device-id.gltf` — target modelScale ≈ 10 / max_dim

---

## Known Constraints

- **Rotato CDN** (`r2.cloudflarestorage.com`) requires signed auth tokens — cannot download `.rotato` files programmatically
- **Model sizes:** 311 MB total for 56 models (5–27 MB each). Exceeds Vercel 100 MB deployment limit — needs Cloudflare R2 for web deploy
- **Compression opportunity:** Draco + KTX2 can reduce to ~80–90 MB total (70% reduction) — not yet applied
- **GLTF format:** Models are `.gltf` (JSON + embedded base64), not `.glb`. Larger than necessary
- **iphone-12-toss-up.gltf:** Exists in models/, is a 4-device composition (proper mesh names) — registered as scene template candidate, not yet added
- **macbook-16.gltf:** Broken extraction (flat dims). Use `macbook-pro-m3-16` instead. Kept in models/ for reference

---

## Git Rules

- **Never add `Co-Authored-By: Claude` trailer** to commit messages — user does not want Claude in GitHub contributors list
- Commit messages: conventional format (`feat:`, `fix:`, `refactor:`, etc.)
- No force-push to main

---

## Stale Files (ignore these)

`iphone-mockup-tool/PROGRESS.md`, `DECISIONS.md`, `SESSION_LOG.md`, `BLOCKERS.md` — from the original 2D canvas prototype (May 1–2, 2026). The app is entirely 3D now. These files describe a completely different architecture.

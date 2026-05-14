# Mockup Tool — Backlog

> Living document. Update after every session. When asking "what can we do?", pick from here.
> Items are grouped by effort so you can match available time to task size.

---

## ⚡ Quick Wins  *(< 2 hours each)*

| # | Item | Why it matters |
|---|------|---------------|
| Q1 | **Shareable URL** — encode full editor state in the URL hash. Zero server required; existing Zustand state serialises trivially. | Marketers need to share mockups with stakeholders. Every competitor has this. |
| Q2 | **"Continue Editing" on home page** — if persisted state exists (non-default device), show a second CTA that skips the browser and jumps straight to the editor. | Power-user quality of life; removes one click for repeat sessions. |
| Q3 | **Keyboard shortcuts** — `Space` = play/pause, `Cmd/Ctrl+E` = export PNG, `Cmd/Ctrl+Shift+E` = export MP4, `Escape` = back to browser. | Pro-feel; competitors with desktop apps have these. |
| Q4 | **Drag-to-upload on canvas** — accept image drops anywhere on the viewport, not just clicking the device screen. | Reduces friction for the core action (adding a screenshot). |
| Q5 | **Export filename from scene name** — already exists for scenes; ensure single-device exports also use a clean slug. | Tiny polish; files named `iphone-16-pro-mockup.png` instead of `mockup.png`. |
| Q6 | **Reset confirmation** — currently resets immediately on click. A single confirm step prevents accidental loss of screenshot + settings. | Crash-prevention hygiene. |
| Q7 | **Loop / once toggle on SeekBar** — a small icon button to switch between looping and one-shot playback. Affects MP4 export (already non-looping) and preview. | Makes the difference between a product animation and a looping social post obvious. |

---

## 🔧 Medium Tasks  *(half day to full day)*

| # | Item | Why it matters |
|---|------|---------------|
| M1 | **Export size presets** — dropdown in the export menu: `App Store 6.7"` (1290×2796), `Stories / TikTok` (1080×1920), `OG Image` (1200×630), `Twitter/X` (1200×675), `Native` (canvas as-is). Resize renderer before recording, restore after. | Marketers copy-paste this list. No competitor auto-sizes for every platform. |
| M2 | **OffscreenCanvas + Web Worker for MP4 export** — move `exportMp4.ts` rendering loop off the main thread. Main thread stays interactive during the entire encode. Ref: [evilmartians guide](https://evilmartians.com/chronicles/faster-webgl-three-js-3d-graphics-with-offscreencanvas-and-web-workers). | Current export blocks the tab. 120-frame 4K export can take 20+ seconds. |
| M3 | **Custom HDRI upload** — `<input type="file" accept=".hdr,.exr">` in the Environment section. Load with `RGBELoader`, process with `PMREMGenerator`. Free HDRIs from Poly Haven; users bring their own. | Power users want studio-match lighting. |
| M4 | **Video as device screen** — accept `.mp4` / `.webm` drops on the device screen in addition to images. Use `THREE.VideoTexture`. | Screen recordings > static screenshots for app demos. Rotato has this; we don't. |
| M5 | **Per-device color in scenes** — SceneEditor currently forces each slot to its model's default color. Expose a color picker per slot in the Screenshots sidebar. | Multi-device scenes need colour variety (e.g., Black + Silver side by side). |
| M6 | **WebGPU renderer flag** — Three.js r171 supports WebGPU via `WebGPURenderer` with automatic WebGL2 fallback. Toggle via a `?webgpu=1` URL param for testing. Expected 3-10× speedup for export rendering. | Future-proofing; export times drop dramatically on modern GPUs. |
| M7 | **Animated background sync to animation tempo** — when both an animation template and an animated background are active, let the background speed scale with the animation's total duration so they feel choreographed. | Visual coherence between the device motion and the background. |

---

## 🏗️ Large Features  *(multi-day, architectural change)*

| # | Item | Why it matters |
|---|------|---------------|
| L1 | **Per-device object animation** — add position, scale, and opacity keyframes per scene slot over time. Unlocks "fly-in," "reveal," "stagger" shots. This is the single biggest gap vs. desktop tools. Architecture: extend `animClock` with per-slot tracks; `SceneEditor` gets a timeline panel. | Without this, every scene is just a static composition with a moving camera. |
| L2 | **Text / callout overlay layer** — a 2D overlay (CSS or Canvas) composited on top of the 3D viewport. Users add text labels with animated leader lines pointing to UI elements. Export bakes the overlay into the PNG/MP4. | #1 marketing use case missing from all 3D mockup tools. Jitter has it for 2D; nobody has it for 3D. |
| L3 | **AI screenshot auto-placement** — detect the device screen region automatically, fit the uploaded image to exact screen aspect, handle notch/Dynamic Island safe zones. API candidates: browser-side ONNX model or a small serverless call. | Reduces the "image looks stretched" problem. Currently users must upload perfectly-sized screenshots. |
| L4 | **Figma plugin** — "Send to Mockup Tool" button in Figma that POSTs the selected frame as a PNG to a local server (or encodes it as a data-URL in a deep link) and opens the tool with it pre-loaded. | This is table stakes — every competitor has it. Reaches designers at the moment they finish designing. |
| L5 | **App Store screenshot generator mode** — a template-first flow: pick "App Store iPhone 6.7"," tool places a device at the correct size, user uploads screenshot, tool adds a heading + subheading text overlay, exports all required sizes in one click. One-click multi-locale later. | Bridges mockup tool → go-to-market tool. Huge value for indie devs and growth marketers. |

---

## 🚀 Moonshots  *(complex / multi-week, but differentiating)*

| # | Item | Why it matters |
|---|------|---------------|
| S1 | **3D Gaussian Splatting backgrounds** — scan a real desk/scene with a phone → load as a `.splat` file in Three.js ([mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D)) → composite device into photorealistic real-world scene. No other mockup tool has this. | Maximum photorealism. A coffee-shop table background that isn't a stock photo. |
| S2 | **Real-time iPhone screen mirroring** — USB connection via WebUSB or a local companion app (Swift/Electron bridge) streams the live iPhone screen into the 3D device texture at 30fps. Rotato's killer feature. | Turns the tool into a live demo recorder, not just a static mockup creator. |
| S3 | **Collaborative sessions** — shared URL where two people see the same scene state in real time. Lightweight: use a CRDT or just a WebSocket relay for state patches. | Teams reviewing mockups asynchronously vs. live together. |
| S4 | **AI scene composition** — describe a scene ("two iPhones floating at an angle with a dark gradient background") and the tool configures device placement, background, and animation template automatically. | Lowers the floor for non-designers further. Anthropic API call on the client. |

---

## ✅ Done

- HDRI environment map lighting (10 presets via drei CDN)
- Animation templates on scenes + seek bar (play/pause/scrub)
- MP4 export via WebCodecs + mp4-muxer (offline, frame-perfect)
- UX overhaul: landing page, unified browser, cleaner editor
- Production cleanup: removed all vendor references, dead code, unused deps
- Model cache + preload system (useModelStatus, preloadAll, per-card status)

---

## How to use this file

- **"What can we do in 30 minutes?"** → Pick from ⚡ Quick Wins
- **"What can we do in a session?"** → Pick from 🔧 Medium Tasks  
- **"What's the next big feature?"** → Pick from 🏗️ Large Features
- **"What would make this genuinely unique?"** → Look at 🚀 Moonshots

When an item is completed, move it to the ✅ Done section with the date.

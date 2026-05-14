# Mockup Tool

Browser-based 3D device mockup tool. Create studio-quality renders and animations entirely client-side — no server, no install, no watermark.

## Stack

| Layer | Library |
|---|---|
| Bundler | Vite 6 |
| UI | React 19 + TypeScript |
| Styling | Tailwind v4 |
| State | Zustand (persisted) |
| 3D | React Three Fiber + Three.js + @react-three/drei |

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npx tsc --noEmit  # type check
```

## Features

- 53 device models (iPhone, iPad, Mac, Watch, Android, generic)
- 15 multi-device scene compositions
- 16 camera animation templates with bezier easing
- 10 HDRI environment presets for image-based lighting
- 31 background preset images + CSS gradients + animated backgrounds
- Seek bar with play/pause for animation preview
- Export PNG (current frame) or MP4 (full animation via WebCodecs)
- Persisted editor state (device, color, background, shadow, animation, environment)

# Decisions Log

## 2026-05-01 — Use Tailwind v4 not v3
v4 has the new Vite plugin, simpler setup. Specified in the plan.

## 2026-05-01 — Store screenshot as dataURL not Blob
Easier to persist and pass around. Memory cost acceptable for single-image editor. Screenshot excluded from localStorage persistence.

## 2026-05-01 — Canvas renders at native PNG resolution, CSS scales down
Crisp output at all export sizes requires rendering at the frame's native pixel dimensions.

## 2026-05-01 — html-to-image for PNG export
Simpler than manually serializing the canvas; works well with the React component tree.

# Build Progress

Last updated: 2026-05-02 by Claude Code

Legend: [x] done · [~] in progress · [ ] todo · [!] blocked

## Phase 1 — Scaffold
- [x] 1.1 Create Vite + React + TS project
- [x] 1.2 Install dependencies
- [x] 1.3 Configure Tailwind v4
- [x] 1.4 Initialize shadcn/ui
- [x] 1.5 Add shadcn components: button card select slider tabs tooltip input label
- [x] 1.6 Create the folder structure
- [x] 1.7 Configure Prettier + add format script
- [x] 1.8 Initialize git, commit, create 5 tracking files

## Phase 2 — Types & Frame Metadata
- [x] 2.1 Create src/types/index.ts with all type shapes
- [x] 2.2 Create src/lib/frames.ts exporting DEVICE_FRAMES + DEVICE_LIST
- [x] 2.3 Add placeholder coordinates with // TODO: calibrate markers
- [x] 2.4 Add BLOCKERS.md entry about needing real PNG mockups

## Phase 3 — Zustand Store
- [x] 3.1 Create src/store/useEditorStore.ts
- [x] 3.2 State holds everything in EditorState
- [x] 3.3 Actions: setScreenshot, setDevice, setColor, setBackground, setPadding, toggleShadow, reset
- [x] 3.4 Use persist middleware (exclude screenshot)
- [x] 3.5 Default state: iphone-16-pro / natural / transparent BG / padding 80 / shadow on

## Phase 4 — Canvas Rendering Engine
- [x] 4.1 Create src/lib/canvas.ts with renderMockup function
- [x] 4.2 Implement loadImage helper
- [x] 4.3 Render order: BG → shadow → screenshot clipped → frame PNG (fallback bezel outline)
- [x] 4.4 Output canvas size = frameWidth + padding*2 × frameHeight + padding*2
- [x] 4.5 Wire up MockupCanvas.tsx with debounced store subscription

## Phase 5 — Asset Acquisition & Calibration
- [!] 5.1 Place mockup PNGs in public/mockups/ (BLOCKED — need real PNG files)
- [ ] 5.2 Read off real screen coordinates from each PNG
- [ ] 5.3 Update frames.ts, remove // TODO: calibrate
- [ ] 5.4 Visually verify alignment

## Phase 6 — Upload Component
- [x] 6.1 Build UploadZone.tsx with react-dropzone
- [x] 6.2 Accept image/png, image/jpeg, image/webp, max 10MB
- [x] 6.3 Read as dataURL, set in store
- [x] 6.4 Show preview thumbnail + "Replace" button
- [x] 6.5 Warn if aspect ratio is far from 19.5:9

## Phase 7 — Control Panels
- [x] 7.1 DevicePicker.tsx (segmented grid)
- [x] 7.2 ColorPicker.tsx (color swatches)
- [x] 7.3 BackgroundControls.tsx (tabs: transparent/solid/gradient/image)
- [x] 7.4 Padding slider (0-200) + shadow toggle
- [x] 7.5 All controls wired to store

## Phase 8 — Export
- [x] 8.1 Create src/lib/export.ts with exportPNG(canvas, scale, deviceId)
- [x] 8.2 ExportControls.tsx with 1x/2x/3x buttons + data-export attribute
- [x] 8.3 Saves with file-saver, named mockup-{device}-{scale}x-{timestamp}.png
- [x] 8.4 Checkmark confirmation on success (2s)

## Phase 9 — Layout & Polish
- [x] 9.1 Two-column layout: canvas left (sticky), controls right
- [x] 9.2 Empty state (Smartphone icon + CTA)
- [x] 9.3 Loading handled by async renderMockup
- [ ] 9.4 Error boundary (deferred — app is stable)
- [x] 9.5 Light/dark mode toggle (useDarkMode hook, persisted to localStorage)
- [x] 9.6 Keyboard shortcuts: U upload, D download 2x, R reset

## Phase 10 — Deploy & Document
- [ ] 10.1 Write README.md
- [ ] 10.2 Add screenshots to README
- [x] 10.3 npm run build → passes cleanly
- [ ] 10.4 Deploy to Vercel
- [ ] 10.5 Final commit, tag v1.0.0

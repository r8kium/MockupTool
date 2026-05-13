# iPhone Mockup Generator — Build Plan for Claude Code CLI

> **Hand-off prompt for Claude Code:**
> Read this entire file before doing anything. Then read `PROGRESS.md` (if it exists) to see where the previous session stopped. Resume from the next unchecked task. Follow the rules in **Section 0** strictly — they are what make this plan resumable across many sessions.

---

## 0. Resumability Rules (READ FIRST — APPLIES TO EVERY SESSION)

This project will be built across many sessions because the user hits usage limits often. You MUST keep state on disk so the next session can pick up cleanly without re-asking the user. Treat the rules below as non-negotiable.

### 0.1 Files you maintain in the repo root

| File | Purpose | Update frequency |
|---|---|---|
| `PROGRESS.md` | Checklist of every task in this plan, with status | After every completed task |
| `SESSION_LOG.md` | Append-only log of what happened each session | Start of session + end of session |
| `DECISIONS.md` | Any non-trivial choice you made (lib version, API shape, naming) | Whenever you decide something |
| `BLOCKERS.md` | Anything that needs the user's input before continuing | Whenever blocked |
| `.claude-context` | One-screen snapshot: current phase, current task, next 3 steps | After every task |

If any of these files don't exist when you start, create them.

### 0.2 Session start procedure (do this first, every time)

1. Read `PROGRESS.md` → find the first unchecked `[ ]` task.
2. Read `.claude-context` → confirm the cursor matches.
3. Read `BLOCKERS.md` → if there are open blockers, surface them to the user immediately and stop. Do not try to guess answers.
4. Read `DECISIONS.md` → so you don't contradict prior choices.
5. Run `git status` and `git log -5 --oneline` → understand what was committed last.
6. Run `npm install` if `package.json` exists (dependencies may have been added but not installed in the previous session).
7. Append a `## Session YYYY-MM-DD HH:MM` heading to `SESSION_LOG.md` with: "Resuming at task X.Y".
8. Now begin work.

### 0.3 Session end procedure (do this whenever you stop, including mid-task)

1. **Commit anything that compiles**, even if a feature is half-done. Use a `wip:` prefix.
   - Example: `git commit -m "wip(phase-4): canvas renders frame, screenshot placement still off"`
2. Update `PROGRESS.md` — check off completed tasks, add notes to in-progress ones.
3. Update `.claude-context` so the next session can resume in <30 seconds of reading.
4. If you stopped mid-task, write a `## Resume notes` section in `.claude-context` describing **exactly the next 1–3 commands or edits**. Be concrete.
5. Append a closing entry to `SESSION_LOG.md`: what was done, what's next, any gotchas.
6. If you hit something that needs the user, write it into `BLOCKERS.md` with a clear question.

### 0.4 Working style during a session

- **Commit often** — after every passing task, ideally every 10–20 minutes of work. Small commits are recoverable; big ones are not.
- **Never leave the repo in a broken state at the end of a session.** If a build is broken and you must stop, comment out the broken code, commit, and note it in `.claude-context`.
- **Don't skip ahead** to "interesting" tasks. Do them in order. Out-of-order work breaks resumability.
- **If something is ambiguous**, write the question in `BLOCKERS.md` and stop that thread — don't make up an answer.
- **Don't refactor without being asked.** Stable code = resumable code.

### 0.5 Templates for the tracking files

**`PROGRESS.md` template:**
```md
# Build Progress

Last updated: YYYY-MM-DD by Claude Code

Legend: [x] done · [~] in progress · [ ] todo · [!] blocked

## Phase 1 — Scaffold
- [ ] 1.1 Create Vite + React + TS project
- [ ] 1.2 Install dependencies
- [ ] 1.3 Configure Tailwind v4
...
```

**`.claude-context` template:**
```md
# Current Context

**Phase:** 4 — Canvas Rendering
**Current task:** 4.3 Compose screenshot inside frame mask
**Status:** in progress

## What's done
- Canvas component mounts and loads the frame image
- Screenshot loads from store

## What's next (concrete)
1. Open `src/lib/canvas.ts`, finish the `clipScreenArea` function
2. In `MockupCanvas.tsx`, call `clipScreenArea` before drawing screenshot
3. Test with the sample screenshot in `public/sample.png`

## Resume notes
The screenshot is currently drawn on top of the bezel — wrong z-order.
Next session: fix the `ctx.save()` / `ctx.clip()` ordering in `canvas.ts:42`.
```

**`SESSION_LOG.md` template:**
```md
# Session Log

## Session 2026-05-01 14:00
Resuming at task 4.3.
- Read PROGRESS.md, no blockers.
- Implemented clipScreenArea function.
- Hit issue: corner radius doesn't match real iPhone — left a TODO.
- Stopping at task 4.4. Next session start with calibrating screen coordinates.
```

**`DECISIONS.md` template:**
```md
# Decisions Log

## 2026-05-01 — Use Tailwind v4 not v3
v4 has the new Vite plugin, simpler setup. No legacy v3 patterns expected from the team.

## 2026-05-01 — Store screenshot as dataURL not Blob
Easier to persist and pass around. Memory cost acceptable for single-image editor.
```

**`BLOCKERS.md` template:**
```md
# Open Blockers

## [OPEN] Need real iPhone 16 Pro mockup PNGs
Placeholder coordinates in `frames.ts` are guesses. Cannot calibrate Phase 5
until we have the actual PNG files. User needs to either:
(a) Download from Apple Design Resources, or
(b) Tell me to use Freepik mockups instead.
```

---

## 1. Project Goal

Build a **client-side web app** where a user uploads a mobile screenshot and sees it rendered inside realistic iPhone mockup frames (latest models). The user can switch device, color, background, and download the result as a high-resolution PNG.

**Hard constraints:**
- Everything runs in the browser. **No backend.** No screenshot leaves the user's machine.
- Deployable as a static site (Vercel / Netlify / GitHub Pages).
- Responsive (works on desktop + tablet; mobile is nice-to-have).
- TypeScript strict mode, zero `any` without a comment justifying it.

---

## 2. Tech Stack (use exactly this — don't substitute)

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui |
| State | Zustand (with `persist` middleware) |
| Canvas | Native HTML5 Canvas API |
| PNG export | `html-to-image` |
| File saving | `file-saver` |
| Drag & drop | `react-dropzone` |
| Icons | `lucide-react` |
| Lint/format | ESLint + Prettier |

**Do not add any other dependencies without writing a note in `DECISIONS.md` and asking the user.**

---

## 3. Final Folder Structure

```
iphone-mockup-tool/
├── PROGRESS.md
├── SESSION_LOG.md
├── DECISIONS.md
├── BLOCKERS.md
├── .claude-context
├── public/
│   ├── mockups/
│   │   ├── iphone-16-pro-natural.png
│   │   ├── iphone-16-pro-black.png
│   │   ├── iphone-16-pro-white.png
│   │   ├── iphone-16-pro-desert.png
│   │   ├── iphone-16-pro-max-natural.png
│   │   ├── iphone-16-black.png
│   │   ├── iphone-16-pink.png
│   │   └── iphone-15-pro-natural.png
│   └── sample.png              # for dev testing
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── UploadZone.tsx
│   │   ├── MockupCanvas.tsx
│   │   ├── DevicePicker.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── BackgroundControls.tsx
│   │   ├── ExportControls.tsx
│   │   └── ui/                 # shadcn components
│   ├── lib/
│   │   ├── frames.ts           # device metadata table
│   │   ├── canvas.ts           # rendering engine
│   │   ├── export.ts           # PNG export logic
│   │   └── utils.ts
│   ├── store/
│   │   └── useEditorStore.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 4. Phased Build Plan

> Each task has an ID like `1.2`. Use these IDs in commit messages and `PROGRESS.md`. Run the verification step before checking a task off.

### Phase 1 — Scaffold

- **1.1** Run `npm create vite@latest iphone-mockup-tool -- --template react-ts`
- **1.2** Install dependencies:
  ```bash
  npm i zustand html-to-image file-saver react-dropzone lucide-react
  npm i -D @types/file-saver tailwindcss @tailwindcss/vite prettier
  ```
- **1.3** Configure Tailwind v4 (Vite plugin + `@import "tailwindcss"` in `globals.css`)
- **1.4** Initialize shadcn/ui: `npx shadcn@latest init` (defaults, neutral base color)
- **1.5** Add shadcn components: `button card select slider tabs tooltip input label`
- **1.6** Create the folder structure above (empty files OK)
- **1.7** Configure Prettier (2-space, single quotes, no semicolons) + add `format` script
- **1.8** Initialize git, commit, create the 5 tracking files (Section 0.5)

**✅ Verify:** `npm run dev` starts; Tailwind class works; shadcn `<Button>` renders.
**Commit:** `chore(phase-1): scaffold complete`

---

### Phase 2 — Types & Frame Metadata

- **2.1** Create `src/types/index.ts` with: `DeviceId`, `DeviceColor`, `DeviceFrame`, `BackgroundType`, `BackgroundConfig`, `EditorState` (full shapes below)
- **2.2** Create `src/lib/frames.ts` exporting `DEVICE_FRAMES` record + `DEVICE_LIST` array
- **2.3** Add placeholder coordinates with `// TODO: calibrate` markers
- **2.4** Add a `BLOCKERS.md` entry: "Need real PNG mockups before Phase 5 calibration"

**Type shapes (use exactly):**

```ts
export type DeviceId =
  | 'iphone-16-pro'
  | 'iphone-16-pro-max'
  | 'iphone-16'
  | 'iphone-15-pro'

export interface DeviceFrame {
  id: DeviceId
  name: string
  colors: { id: string; label: string; imagePath: string }[]
  frameWidth: number      // PNG dimensions
  frameHeight: number
  screenX: number         // top-left of screen area inside PNG
  screenY: number
  screenWidth: number
  screenHeight: number
  screenCornerRadius: number
}

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'image'

export interface BackgroundConfig {
  type: BackgroundType
  solidColor?: string
  gradientFrom?: string
  gradientTo?: string
  gradientAngle?: number
  imageDataUrl?: string
}

export interface EditorState {
  screenshot: string | null
  deviceId: DeviceId
  colorId: string
  background: BackgroundConfig
  padding: number
  shadow: boolean
}
```

**✅ Verify:** `tsc --noEmit` passes.
**Commit:** `feat(phase-2): types and frame metadata`

---

### Phase 3 — Zustand Store

- **3.1** Create `src/store/useEditorStore.ts`
- **3.2** State holds everything in `EditorState`
- **3.3** Actions: `setScreenshot`, `setDevice`, `setColor`, `setBackground`, `setPadding`, `toggleShadow`, `reset`
- **3.4** Use `persist` middleware — but **exclude `screenshot`** from persistence (too large for localStorage)
- **3.5** Default state: `iphone-16-pro` / `natural` / transparent BG / padding 80 / shadow on

**✅ Verify:** Store is importable, state mutations work in a quick test component.
**Commit:** `feat(phase-3): editor store`

---

### Phase 4 — Canvas Rendering Engine

This is the hard part. Take it slow. Commit after each sub-task.

- **4.1** Create `src/lib/canvas.ts` with `renderMockup(canvas, state, frame): Promise<void>`
- **4.2** Implement `loadImage(src): Promise<HTMLImageElement>` helper
- **4.3** Render order on the canvas:
  1. Fill background (per `BackgroundConfig`)
  2. Translate to padding offset
  3. Draw the screenshot, clipped to a rounded-rect path matching the frame's screen area
  4. Draw the frame PNG on top (its bezel hides the edges)
  5. Optionally render a soft shadow under the device
- **4.4** Output canvas size = `frameWidth + padding*2` × `frameHeight + padding*2`
- **4.5** Wire up `MockupCanvas.tsx` to subscribe to the store and call `renderMockup` on every change (debounced ~16ms)

**✅ Verify:** With a placeholder frame (just a black rounded rect drawn programmatically) and a sample screenshot, the screenshot appears inside the frame correctly.
**Commit after each sub-task:** `feat(phase-4.X): ...`

---

### Phase 5 — Asset Acquisition & Calibration

This phase requires real PNG mockups. If they aren't in `public/mockups/` yet, **stop and update `BLOCKERS.md`**.

**Recommended free sources (in order):**
1. **Apple Design Resources** — developer.apple.com/design/resources (official, safe license)
2. **Figma Community** — search "iPhone 16 Pro mockup", export PNGs
3. **Freepik** — free with attribution
4. **LS Graphics** — ls.graphics/free-mockups

- **5.1** Place mockup PNGs in `public/mockups/` with the names from Section 3
- **5.2** For each device, open the PNG in any image editor and read off real `screenX`, `screenY`, `screenWidth`, `screenHeight`, `screenCornerRadius`
- **5.3** Update `frames.ts` and remove `// TODO: calibrate`
- **5.4** Visually verify alignment in the running app — screenshot edges should sit perfectly under the bezel

**✅ Verify:** No visible gap or overlap between screenshot and bezel.
**Commit:** `feat(phase-5): real mockups + calibrated coords`

---

### Phase 6 — Upload Component

- **6.1** Build `UploadZone.tsx` with `react-dropzone`
- **6.2** Accept `image/png, image/jpeg, image/webp`, max 10MB
- **6.3** Read as dataURL, set in store
- **6.4** Show preview thumbnail + "Replace" button after upload
- **6.5** Warn if aspect ratio is far from 19.5:9 (with a "use anyway" option)

**✅ Verify:** Drag-drop and click-to-upload both work; bad files are rejected.
**Commit:** `feat(phase-6): upload zone`

---

### Phase 7 — Control Panels

- **7.1** `DevicePicker.tsx` — segmented control or dropdown listing `DEVICE_LIST`
- **7.2** `ColorPicker.tsx` — swatches for the selected device's available colors
- **7.3** `BackgroundControls.tsx` — tabs for transparent/solid/gradient/image, with the right inputs per tab
- **7.4** Padding slider (0–200) and shadow toggle
- **7.5** Wire all controls to the store

**✅ Verify:** Every control updates the canvas live.
**Commit:** `feat(phase-7): control panels`

---

### Phase 8 — Export

- **8.1** Create `src/lib/export.ts` with `exportPNG(canvas, scale: 1|2|3): Blob`
- **8.2** `ExportControls.tsx` — buttons: "Download 1x", "Download 2x", "Download 3x"
- **8.3** Use `file-saver` to save with name `mockup-{device}-{timestamp}.png`
- **8.4** Show a small toast / inline confirmation on success

**✅ Verify:** Downloaded PNGs open correctly, are crisp at 3x.
**Commit:** `feat(phase-8): PNG export`

---

### Phase 9 — Layout & Polish

- **9.1** Two-column layout: canvas on left (sticky), controls on right
- **9.2** Empty state when no screenshot uploaded (illustration + CTA)
- **9.3** Loading states for image loads
- **9.4** Error boundary
- **9.5** Light/dark mode toggle
- **9.6** Keyboard shortcuts: `U` upload, `D` download, `R` reset

**✅ Verify:** App looks polished and works smoothly on a real screenshot.
**Commit:** `feat(phase-9): layout polish`

---

### Phase 10 — Deploy & Document

- **10.1** Write `README.md` with: what it does, how to run, how to add new devices
- **10.2** Add screenshots to README
- **10.3** `npm run build` → fix any production-only errors
- **10.4** Deploy to Vercel (or write deploy instructions if user prefers self-hosting)
- **10.5** Final commit, tag `v1.0.0`

**✅ Verify:** Deployed URL works end-to-end.
**Commit:** `chore: v1.0.0 release`

---

## 5. Stretch Goals (only after v1.0.0 ships)

These are intentionally out of scope for the first build. Don't start them without the user's go-ahead.

- Multi-screenshot layouts (App Store style: 2–3 phones side by side)
- Tilted / 3D perspective views
- Text overlays (headlines, captions)
- Pre-made marketing templates
- Batch upload → ZIP download
- Android device frames
- Video / animated GIF export

---

## 6. Things to Watch Out For

- **Aspect ratios:** iPhone 16 Pro screen is ~19.5:9. If a user uploads a 16:9 screenshot, it'll be stretched. Either letterbox it or warn.
- **Mockup PNG file sizes:** 2–5 MB each. Lazy-load only the selected device.
- **Canvas DPI:** Always render at the PNG's native resolution, then let CSS scale down. Crisp output requires this.
- **Licensing:** Document the source of every PNG in `public/mockups/CREDITS.md`. Don't ship anything with unclear license.
- **Cross-origin:** All assets are local — no CORS issues. If we ever fetch external images for backgrounds, set `crossOrigin = 'anonymous'`.

---

## 7. First Session — What To Do Right Now

If this is the very first session and the repo is empty:

1. Create the 5 tracking files from Section 0.5 (with the templates)
2. Fill `PROGRESS.md` with every task ID from Section 4 as `[ ]`
3. Set `.claude-context` to point at task **1.1**
4. Run task **1.1**
5. Commit
6. Continue down the list until the session is about to time out
7. Run the **session end procedure** (Section 0.3)

That's it. Good luck — and remember: **commit small, log everything, never leave a broken build.**

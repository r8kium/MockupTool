// Shared mutable clock — written each frame by AnimatedCamera, read by AnimThumbnail RAF loops.
export const animClock = {
  templateId: null as string | null,
  elapsed: 0,
  paused: false,
  seekTo: null as number | null,
}

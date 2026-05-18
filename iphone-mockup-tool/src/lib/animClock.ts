// Shared mutable clock — written each frame by AnimatedCamera, read by AnimThumbnail RAF loops.
export const animClock = {
  templateId: null as string | null,
  elapsed: 0,
  elapsedForText: 0,   // advances even without a camera animation template
  paused: false,
  seekTo: null as number | null,
}

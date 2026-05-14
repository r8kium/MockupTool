import { ANIM_BG_MAP } from '@/lib/animBackgrounds'


interface Props { id: string }

export function AnimatedBackground({ id }: Props) {
  const preset = ANIM_BG_MAP[id]
  if (!preset) return null

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: preset.base }}
    >
      {preset.blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.w,
            height: blob.h,
            background: blob.color,
            filter: 'blur(80px)',
            opacity: blob.opacity,
            animation: `bg-blob-${blob.anim} ${blob.duration}s ease-in-out ${blob.delay}s infinite alternate`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}

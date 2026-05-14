// CSS 3D phone thumbnail for animation template cards.
// Shows the current device screenshot (or blank screen) animated in 3D
// to approximate the camera movement of each template.

const ANIM: Record<string, string> = {
  'float':          'tpl-float          2.5s ease-in-out infinite',
  'tilt':           'tpl-tilt           3s   ease-in-out infinite',
  'dolly-in':       'tpl-dolly-in       3s   ease-in-out infinite',
  'dolly-out':      'tpl-dolly-out      3s   ease-in-out infinite',
  'orbit':          'tpl-orbit          6s   ease-in-out infinite',
  '01-topturn':     'tpl-top-turn       4.5s ease-in-out infinite',
  '02-bottom-turn': 'tpl-bottom-turn    6s   ease-in-out infinite',
  '03-flip-in':     'tpl-flip-in        6s   ease-in-out infinite',
  '04-flip-up':     'tpl-flip-up        6s   ease-in-out infinite',
  '05-pan-across':  'tpl-pan-across     6s   ease-in-out infinite',
  '06-hover':       'tpl-hover          3s   ease-in-out infinite',
  '08-slide-in':    'tpl-slide-in       6s   ease-in-out infinite',
  '09-dangle':      'tpl-dangle         6s   ease-in-out infinite',
  '10-hoist-down':  'tpl-hoist-down     6s   ease-in-out infinite',
  '11-edging':      'tpl-edging         6s   ease-in-out infinite',
  '12-slide-in':    'tpl-slide-in-top   6s   ease-in-out infinite',
}

interface Props {
  templateId: string
  screenshot: string | null
}

export function AnimThumbnail({ templateId, screenshot }: Props) {
  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden bg-[#2a2a2a]"
      style={{ perspective: '300px' }}
    >
      <div
        style={{
          height: '84%',
          aspectRatio: '9 / 19.5',
          position: 'relative',
          flexShrink: 0,
          animation: ANIM[templateId],
          willChange: 'transform',
        }}
      >
        {/* Phone body */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '13%',
          background: '#cacaca',
          boxShadow: '0 3px 18px rgba(0,0,0,0.65)',
        }} />

        {/* Screen bezel inset */}
        <div style={{
          position: 'absolute',
          inset: '4% 5% 4% 5%',
          borderRadius: '9%',
          background: '#111',
          overflow: 'hidden',
        }}>
          {screenshot
            ? <img src={screenshot} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />
          }
        </div>
      </div>
    </div>
  )
}

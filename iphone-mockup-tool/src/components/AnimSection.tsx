import { useEditorStore } from '@/store/useEditorStore'
import { ANIM_TEMPLATES } from '@/lib/animTemplates'
import { AnimThumbnail } from '@/components/AnimThumbnail'
import { cn } from '@/lib/utils'

interface Props {
  screenshot: string | null
}

export function AnimSection({ screenshot }: Props) {
  const state = useEditorStore()
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => state.setAnimTemplate(null)}
        className={cn(
          'relative rounded-lg overflow-hidden border-2 transition-all aspect-video flex items-center justify-center text-xs font-medium',
          state.animTemplateId === null
            ? 'border-blue-500 text-blue-300 bg-blue-500/10'
            : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/60 bg-white/3'
        )}
      >
        None
      </button>

      {ANIM_TEMPLATES.map((tpl) => {
        const active = state.animTemplateId === tpl.id
        return (
          <button
            key={tpl.id}
            onClick={() => state.setAnimTemplate(tpl.id)}
            className={cn(
              'relative rounded-lg overflow-hidden border-2 transition-all aspect-video group',
              active ? 'border-blue-500' : 'border-white/10 hover:border-white/30'
            )}
          >
            <AnimThumbnail templateId={tpl.id} screenshot={screenshot} />
            <div className={cn(
              'absolute inset-0 flex items-end p-1.5 bg-gradient-to-t from-black/70 to-transparent transition-opacity pointer-events-none',
              active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
              <span className="text-[10px] font-medium text-white leading-tight">{tpl.name}</span>
            </div>
            {active && (
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 pointer-events-none" />
            )}
          </button>
        )
      })}
    </div>
  )
}

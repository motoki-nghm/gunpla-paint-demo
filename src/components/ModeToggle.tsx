import { ApiMode } from '@/types'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

const LABELS: Record<ApiMode, string> = {
  [ApiMode.FREE]: '標準',
  [ApiMode.PAID]: '高精度',
}

export default function ModeToggle() {
  const apiMode = usePaintDemoStore((s) => s.apiMode)
  const setApiMode = usePaintDemoStore((s) => s.setApiMode)

  const isStandard = apiMode === ApiMode.FREE

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <span className="text-xs font-mono text-slate-400 tracking-widest">
        {LABELS[apiMode]}
      </span>

      <button
        role="switch"
        aria-checked={!isStandard}
        aria-label={`モード: ${LABELS[apiMode]}。クリックで${LABELS[isStandard ? ApiMode.PAID : ApiMode.FREE]}に切替`}
        onClick={() => setApiMode(isStandard ? ApiMode.PAID : ApiMode.FREE)}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full',
          'border-2 border-transparent transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          isStandard ? 'bg-slate-700' : 'bg-violet-600',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md',
            'transform transition-transform duration-200',
            isStandard ? 'translate-x-0.5' : 'translate-x-[1.375rem]',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

import { ApiMode } from '@/types'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

export default function ModeToggle() {
  const apiMode = usePaintDemoStore((s) => s.apiMode)
  const setApiMode = usePaintDemoStore((s) => s.setApiMode)

  const isFree = apiMode === ApiMode.FREE

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <span
        className={[
          'text-xs font-mono uppercase tracking-widest transition-colors',
          isFree ? 'text-zinc-400' : 'text-amber-400',
        ].join(' ')}
      >
        {isFree ? 'FREE' : 'PAID'}
      </span>

      <button
        role="switch"
        aria-checked={!isFree}
        aria-label={`API mode: ${apiMode}. Click to switch to ${isFree ? 'PAID' : 'FREE'}.`}
        onClick={() => setApiMode(isFree ? ApiMode.PAID : ApiMode.FREE)}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full',
          'border-2 border-transparent transition-colors duration-200 focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
          isFree ? 'bg-zinc-600' : 'bg-amber-400',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md',
            'transform transition-transform duration-200',
            isFree ? 'translate-x-0.5' : 'translate-x-[1.375rem]',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

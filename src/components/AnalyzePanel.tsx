import { usePaintDemoStore } from '@/stores/paintDemoStore'

export default function AnalyzePanel() {
  const userNote = usePaintDemoStore((s) => s.userNote)
  const setUserNote = usePaintDemoStore((s) => s.setUserNote)
  const analyze = usePaintDemoStore((s) => s.analyze)
  const isAnalyzing = usePaintDemoStore((s) => s.isAnalyzing)
  const uploadedFile = usePaintDemoStore((s) => s.uploadedFile)
  const error = usePaintDemoStore((s) => s.error)

  const canAnalyze = !isAnalyzing && !!uploadedFile

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="user-note"
          className="block text-xs font-medium text-white/50 uppercase tracking-widest"
        >
          希望・要望（任意）
        </label>
        <textarea
          id="user-note"
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder={'例: "ネイビーとゴールドで統一したい" "ガンダムマーカーのみで仕上げたい"'}
          rows={3}
          className={[
            'w-full resize-none rounded-xl border bg-white/5 px-4 py-3',
            'text-sm text-white/80 placeholder-white/20',
            'outline-none transition-all duration-150',
            'border-white/10 focus:border-violet-500/50 focus:bg-white/8 focus:ring-1 focus:ring-violet-500/30',
          ].join(' ')}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400" role="alert" aria-live="polite">{error}</p>
      )}

      <button
        onClick={analyze}
        disabled={!canAnalyze}
        aria-busy={isAnalyzing}
        className={[
          'relative w-full overflow-hidden rounded-xl px-6 py-3.5',
          'text-sm font-semibold tracking-wide transition-all duration-200',
          canAnalyze
            ? 'text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98]'
            : 'cursor-not-allowed text-white/30',
        ].join(' ')}
        style={canAnalyze ? {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
        } : { background: 'rgba(255,255,255,0.05)' }}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon className="h-4 w-4 animate-spin" />
            AI が分析中…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <SparkleIcon className="h-4 w-4" />
            カラーを分析
          </span>
        )}
      </button>
    </div>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  )
}

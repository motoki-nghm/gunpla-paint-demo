import { usePaintDemoStore } from '@/stores/paintDemoStore'

const PLACEHOLDER = '例: "全体をパールホワイトとゴールドのキャンディコートで塗装して"'

export default function PromptPanel() {
  const prompt = usePaintDemoStore((s) => s.prompt)
  const setPrompt = usePaintDemoStore((s) => s.setPrompt)
  const generate = usePaintDemoStore((s) => s.generate)
  const isGenerating = usePaintDemoStore((s) => s.isGenerating)
  const uploadedFile = usePaintDemoStore((s) => s.uploadedFile)
  const error = usePaintDemoStore((s) => s.error)

  const canGenerate = !isGenerating && !!uploadedFile && prompt.trim().length > 0

  return (
    <div className="space-y-3">
      <label
        htmlFor="paint-prompt"
        className="block text-xs font-mono text-violet-400 uppercase tracking-widest"
      >
        塗装指示
      </label>

      <textarea
        id="paint-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={4}
        className={[
          'w-full resize-none rounded-xl border bg-slate-900 px-4 py-3',
          'text-sm text-slate-100 placeholder-slate-600',
          'outline-none transition-colors duration-150',
          'border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
        ].join(' ')}
      />

      {error && (
        <p className="text-xs text-red-400" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <button
        onClick={generate}
        disabled={!canGenerate}
        aria-busy={isGenerating}
        className={[
          'flex w-full items-center justify-center rounded-xl px-6 py-3',
          'text-sm font-semibold transition-all duration-150',
          canGenerate
            ? 'bg-violet-600 text-white hover:bg-violet-500 active:scale-[0.98]'
            : 'cursor-not-allowed bg-slate-800 text-slate-500',
        ].join(' ')}
      >
        {isGenerating ? (
          <>
            <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
            生成中…
          </>
        ) : (
          '塗装を生成'
        )}
      </button>
    </div>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

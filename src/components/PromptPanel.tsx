import { usePaintDemoStore } from '@/stores/paintDemoStore'

const PLACEHOLDER =
  'e.g. "Paint the torso armor matte black with gold trim and battle damage weathering"'

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
        className="block text-xs font-mono text-zinc-400 uppercase tracking-widest"
      >
        Paint Instruction
      </label>

      <textarea
        id="paint-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={4}
        className={[
          'w-full resize-none rounded-lg border bg-zinc-800 px-4 py-3',
          'text-sm text-zinc-100 placeholder-zinc-600',
          'outline-none transition-colors duration-150',
          'focus:border-amber-400 focus:ring-1 focus:ring-amber-400',
          'border-zinc-700',
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
          'flex w-full items-center justify-center rounded-lg px-6 py-3',
          'text-sm font-semibold transition-all duration-150',
          canGenerate
            ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300 active:scale-[0.98]'
            : 'cursor-not-allowed bg-zinc-700 text-zinc-500',
        ].join(' ')}
      >
        {isGenerating ? (
          <>
            <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          'Generate Paint'
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
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

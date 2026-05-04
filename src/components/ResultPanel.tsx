import { GenerationResult } from '@/types'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

export default function ResultPanel() {
  const generationResult = usePaintDemoStore((s) => s.generationResult)
  const isGenerating = usePaintDemoStore((s) => s.isGenerating)
  const reset = usePaintDemoStore((s) => s.reset)

  if (isGenerating) {
    return <GeneratingPlaceholder />
  }

  if (!generationResult) {
    return <EmptyPlaceholder />
  }

  return <ResultView result={generationResult} onReset={reset} />
}

// ──────────────────────────────────────────────
//  Sub-views
// ──────────────────────────────────────────────

function EmptyPlaceholder() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/40">
      <p className="text-sm text-zinc-600">Result will appear here</p>
    </div>
  )
}

function GeneratingPlaceholder() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-800/40">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-400" />
      <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
        Gemini is painting…
      </p>
    </div>
  )
}

function ResultView({
  result,
  onReset,
}: {
  result: GenerationResult
  onReset: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Before / After</p>
        <button
          onClick={onReset}
          className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImageCard label="Before" src={result.inputImageUrl} />
        <ImageCard label="After" src={result.outputImageUrl} />
      </div>

      <ResultMeta result={result} />
    </div>
  )
}

function ImageCard({ label, src }: { label: string; src: string }) {
  return (
    <div className="space-y-1">
      <p className="text-center text-xs font-mono text-zinc-500">{label}</p>
      <img
        src={src}
        alt={`${label} gunpla image`}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 object-contain"
        style={{ maxHeight: '240px' }}
      />
    </div>
  )
}

function ResultMeta({ result }: { result: GenerationResult }) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 space-y-1">
      <p className="text-xs font-mono text-zinc-400">
        <span className="text-zinc-500">Prompt:</span>{' '}
        <span className="text-zinc-300">{result.prompt}</span>
      </p>
      <p className="text-xs font-mono text-zinc-600">
        Mode: {result.mode} · {result.createdAt.toLocaleTimeString()}
      </p>
    </div>
  )
}

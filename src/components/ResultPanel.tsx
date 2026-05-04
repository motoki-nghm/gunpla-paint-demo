import { GenerationResult } from '@/types'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

const MODE_LABEL = { FREE: '標準', PAID: '高精度' }

export default function ResultPanel() {
  const generationResult = usePaintDemoStore((s) => s.generationResult)
  const isGenerating = usePaintDemoStore((s) => s.isGenerating)
  const reset = usePaintDemoStore((s) => s.reset)

  if (isGenerating) return <GeneratingPlaceholder />
  if (!generationResult) return <EmptyPlaceholder />
  return <ResultView result={generationResult} onReset={reset} />
}

function EmptyPlaceholder() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40">
      <p className="text-sm text-slate-600">生成結果がここに表示されます</p>
    </div>
  )
}

function GeneratingPlaceholder() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">AI が塗装中…</p>
    </div>
  )
}

function ResultView({ result, onReset }: { result: GenerationResult; onReset: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-violet-400 uppercase tracking-widest">変更前 / 変更後</p>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-300"
        >
          リセット
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImageCard label="変更前" src={result.inputImageUrl} />
        <ImageCard label="変更後" src={result.outputImageUrl} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 space-y-1">
        <p className="text-xs font-mono text-slate-400">
          <span className="text-slate-500">指示: </span>
          <span className="text-slate-200">{result.prompt}</span>
        </p>
        <p className="text-xs font-mono text-slate-600">
          モード: {MODE_LABEL[result.mode]} · {result.createdAt.toLocaleTimeString('ja-JP')}
        </p>
      </div>
    </div>
  )
}

function ImageCard({ label, src }: { label: string; src: string }) {
  return (
    <div className="space-y-1">
      <p className="text-center text-xs font-mono text-slate-500">{label}</p>
      <img
        src={src}
        alt={`${label}のガンプラ画像`}
        className="w-full max-h-60 rounded-xl border border-slate-700 bg-slate-900 object-contain"
      />
    </div>
  )
}

import ModeToggle from '@/components/ModeToggle'
import UploadPanel from '@/components/UploadPanel'
import PromptPanel from '@/components/PromptPanel'
import ResultPanel from '@/components/ResultPanel'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ModeToggle />

      <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ガンプラ塗装デモ
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            ガンプラの写真をアップロードして、塗装イメージを AI に生成させよう
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <UploadPanel />
            <PromptPanel />
          </div>
          <div>
            <ResultPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

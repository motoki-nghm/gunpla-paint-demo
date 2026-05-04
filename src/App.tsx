import UploadPanel from '@/components/UploadPanel'
import AnalyzePanel from '@/components/AnalyzePanel'
import AnalysisResult from '@/components/AnalysisResult'
import ExportPanel from '@/components/ExportPanel'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

export default function App() {
  const analysis = usePaintDemoStore((s) => s.analysis)
  const isAnalyzing = usePaintDemoStore((s) => s.isAnalyzing)

  const showResult = analysis || isAnalyzing

  return (
    <div className="min-h-screen text-white" style={{ background: '#08080f' }}>
      {/* Gradient ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10 space-y-10">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
              Powered by Gemini
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #fff 30%, #a78bfa 70%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ガンプラ塗装カラーアドバイザー
          </h1>
          <p className="text-sm text-white/40 max-w-lg">
            ガンプラの写真をアップロードすると、部位ごとの現在色を分析し、
            調色レシピと色見本を提案します
          </p>
        </header>

        {/* Input section */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <UploadPanel />
          <AnalyzePanel />
        </div>

        {/* Divider */}
        {showResult && (
          <div className="flex items-center gap-4">
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.3), transparent)' }} />
            <span className="text-xs text-white/30 uppercase tracking-widest">分析結果</span>
            <div className="h-px flex-1"
              style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.3), transparent)' }} />
          </div>
        )}

        {/* Result */}
        <AnalysisResult />

        {/* Export */}
        <ExportPanel />
      </div>
    </div>
  )
}

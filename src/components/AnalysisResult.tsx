import { GunplaAnalysis, BlockAnalysis, PaintRecommendation, ColorInfo, RecommendationType } from '@/types'
import { usePaintDemoStore } from '@/stores/paintDemoStore'

const TYPE_CONFIG: Record<RecommendationType, { label: string; gradient: string; text: string }> = {
  change:  { label: '変更',        gradient: 'from-orange-500 to-pink-500',   text: 'text-orange-300' },
  add:     { label: '追加',        gradient: 'from-blue-500 to-cyan-400',     text: 'text-cyan-300' },
  accent:  { label: 'アクセント', gradient: 'from-violet-500 to-fuchsia-500', text: 'text-violet-300' },
}

export default function AnalysisResult() {
  const analysis = usePaintDemoStore((s) => s.analysis)
  const isAnalyzing = usePaintDemoStore((s) => s.isAnalyzing)
  const reset = usePaintDemoStore((s) => s.reset)

  if (isAnalyzing) return <AnalyzingView />
  if (!analysis) return null

  return (
    <div className="space-y-8">
      <KitHeader analysis={analysis} onReset={reset} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {analysis.blocks.map((block) => (
          <BlockCard key={block.blockName} block={block} />
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Sub-views
// ──────────────────────────────────────────────

function AnalyzingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-2 border-violet-500/20" />
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-violet-500" />
        <div className="absolute inset-2 flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-white/70">AI が機体を分析中…</p>
        <p className="text-xs text-white/30">部位ごとの色を解析しています</p>
      </div>
    </div>
  )
}

function KitHeader({ analysis, onReset }: { analysis: GunplaAnalysis; onReset: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
            分析完了
          </span>
          <span className="text-xs text-white/30">{analysis.blocks.length} 部位</span>
        </div>
        <h2 className="text-xl font-bold text-white">{analysis.kitName}</h2>
        <p className="text-sm text-white/50">{analysis.overallStyle}</p>
      </div>
      <button
        onClick={onReset}
        className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:border-white/20 hover:text-white/70 transition-colors"
      >
        リセット
      </button>
    </div>
  )
}

function BlockCard({ block }: { block: BlockAnalysis }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-[1px]"
      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(255,255,255,0.03) 60%, rgba(236,72,153,0.1) 100%)' }}
    >
      <div className="rounded-2xl bg-[#0e0e18] p-4 space-y-4 h-full">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white/90 text-sm">{block.blockName}</h3>
          <div className="flex gap-1">
            {block.currentColors.map((c) => (
              <ColorChip key={c.hex} color={c} size="sm" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {block.recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: PaintRecommendation }) {
  const cfg = TYPE_CONFIG[rec.type]

  return (
    <div className="rounded-xl bg-white/[0.03] p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${cfg.gradient} px-2 py-0.5 text-[10px] font-bold text-white`}>
          {cfg.label}
        </span>
        <p className="text-xs text-white/60 leading-snug">{rec.description}</p>
      </div>

      <div className="flex items-center gap-2">
        {rec.from && (
          <>
            <ColorChip color={rec.from} size="md" showName />
            <ArrowIcon />
          </>
        )}
        {!rec.from && rec.type !== 'change' && (
          <span className="text-xs text-white/30">追加 →</span>
        )}
        <ColorChip color={rec.to} size="md" showName />
      </div>

      <div className="rounded-lg bg-black/30 px-3 py-2 space-y-1">
        <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">調色レシピ</p>
        <p className="text-xs text-white/70 font-mono leading-relaxed">{rec.recipe}</p>
      </div>

      <p className="text-xs text-white/40 italic">{rec.effect}</p>
    </div>
  )
}

function ColorChip({
  color,
  size = 'sm',
  showName = false,
}: {
  color: ColorInfo
  size?: 'sm' | 'md'
  showName?: boolean
}) {
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-1.5" title={`${color.name} ${color.hex}`}>
      <div
        className={`${dim} shrink-0 rounded-full border border-white/20 shadow-sm`}
        style={{ backgroundColor: color.hex }}
      />
      {showName && (
        <span className="text-[10px] text-white/60 max-w-[60px] truncate">{color.name}</span>
      )}
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

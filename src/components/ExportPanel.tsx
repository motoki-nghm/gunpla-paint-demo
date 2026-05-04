import { useState } from 'react'
import { usePaintDemoStore } from '@/stores/paintDemoStore'
import {
  generateMarkdown,
  generateChatGPTPrompt,
  downloadPdf,
  copyToClipboard,
  downloadTextFile,
} from '@/lib/exportUtils'

type CopyState = 'idle' | 'copied' | 'error'

export default function ExportPanel() {
  const analysis = usePaintDemoStore((s) => s.analysis)
  if (!analysis) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.3), transparent)' }} />
        <span className="text-xs text-white/30 uppercase tracking-widest">エクスポート</span>
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.3), transparent)' }} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MarkdownExport analysis={analysis} />
        <PdfExport kitName={analysis.kitName} />
        <ChatGPTExport analysis={analysis} />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Markdown → Notion
// ──────────────────────────────────────────────

function MarkdownExport({ analysis }: { analysis: NonNullable<ReturnType<typeof usePaintDemoStore.getState>['analysis']> }) {
  const [state, setState] = useState<CopyState>('idle')

  async function handleCopy() {
    try {
      await copyToClipboard(generateMarkdown(analysis))
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <ExportCard
      icon="📋"
      title="Markdown コピー"
      description="Notion やメモアプリに貼り付けられる形式でコピー"
      badge="Notion 対応"
      badgeColor="from-emerald-500 to-teal-400"
    >
      <CopyButton state={state} onClick={handleCopy} />
    </ExportCard>
  )
}

// ──────────────────────────────────────────────
//  PDF Download
// ──────────────────────────────────────────────

function PdfExport({ kitName }: { kitName: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const filename = `${kitName.replace(/\s+/g, '_')}_paint_analysis.pdf`
      await downloadPdf('analysis-result', filename)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ExportCard
      icon="📄"
      title="PDF ダウンロード"
      description="分析結果を PDF で保存。カラースウォッチ付き"
      badge="html2canvas"
      badgeColor="from-blue-500 to-indigo-400"
    >
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full rounded-lg border border-blue-500/30 bg-blue-500/10 py-2 text-xs font-medium text-blue-300 transition-all hover:border-blue-400/50 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '生成中…' : 'ダウンロード'}
      </button>
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </ExportCard>
  )
}

// ──────────────────────────────────────────────
//  ChatGPT Image 2 Prompt
// ──────────────────────────────────────────────

function ChatGPTExport({ analysis }: { analysis: NonNullable<ReturnType<typeof usePaintDemoStore.getState>['analysis']> }) {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const prompt = generateChatGPTPrompt(analysis)
  const filename = `${analysis.kitName.replace(/\s+/g, '_')}_chatgpt_prompt.txt`

  async function handleCopy() {
    try {
      await copyToClipboard(prompt)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  function handleDownload() {
    downloadTextFile(prompt, filename)
  }

  return (
    <ExportCard
      icon="🤖"
      title="ChatGPT Image 2 プロンプト"
      description="生成 AI に渡すための英語プロンプトを自動生成"
      badge="GPT Image 2"
      badgeColor="from-violet-500 to-fuchsia-500"
    >
      <div className="rounded-lg bg-black/30 p-2 max-h-24 overflow-y-auto mb-2">
        <p className="text-[10px] text-white/50 font-mono leading-relaxed whitespace-pre-wrap">
          {prompt.slice(0, 200)}
          {prompt.length > 200 && '…'}
        </p>
      </div>
      <div className="flex gap-2">
        <CopyButton state={copyState} onClick={handleCopy} className="flex-1" />
        <button
          onClick={handleDownload}
          className="flex-1 rounded-lg border border-violet-500/30 bg-violet-500/10 py-2 text-xs font-medium text-violet-300 transition-all hover:border-violet-400/50 hover:bg-violet-500/20"
        >
          .txt 保存
        </button>
      </div>
    </ExportCard>
  )
}

// ──────────────────────────────────────────────
//  Shared sub-components
// ──────────────────────────────────────────────

function ExportCard({
  icon,
  title,
  description,
  badge,
  badgeColor,
  children,
}: {
  icon: string
  title: string
  description: string
  badge: string
  badgeColor: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl p-[1px]"
      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(255,255,255,0.03) 60%, rgba(236,72,153,0.1) 100%)' }}
    >
      <div className="rounded-2xl bg-[#0e0e18] p-4 space-y-3 h-full flex flex-col">
        <div className="flex items-start gap-2">
          <span className="text-lg">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-semibold text-white/90">{title}</h3>
              <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${badgeColor} px-1.5 py-0.5 text-[9px] font-bold text-white`}>
                {badge}
              </span>
            </div>
            <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{description}</p>
          </div>
        </div>
        <div className="mt-auto">{children}</div>
      </div>
    </div>
  )
}

function CopyButton({
  state,
  onClick,
  className = '',
}: {
  state: CopyState
  onClick: () => void
  className?: string
}) {
  const label = state === 'copied' ? 'コピー完了 ✓' : state === 'error' ? 'エラー' : 'クリップボードにコピー'
  const colorClass =
    state === 'copied'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : state === 'error'
      ? 'border-red-500/30 bg-red-500/10 text-red-300'
      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80'

  return (
    <button
      onClick={onClick}
      className={`rounded-lg border py-2 text-xs font-medium transition-all ${colorClass} ${className}`}
    >
      {label}
    </button>
  )
}

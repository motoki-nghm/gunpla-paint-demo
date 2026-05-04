// ──────────────────────────────────────────────
//  Color Analysis Types
// ──────────────────────────────────────────────

export interface ColorInfo {
  name: string  // 色名（日本語）
  hex: string   // #RRGGBB
}

export type RecommendationType = 'change' | 'add' | 'accent'

export interface PaintRecommendation {
  type: RecommendationType
  description: string   // 提案の説明
  from?: ColorInfo      // 元の色（change のみ）
  to: ColorInfo         // 変更後 or 追加する色
  recipe: string        // 調色レシピ（製品名・比率）
  effect: string        // 仕上がりイメージ
}

export interface BlockAnalysis {
  blockName: string
  currentColors: ColorInfo[]
  recommendations: PaintRecommendation[]
}

export interface GunplaAnalysis {
  kitName: string       // 推定機体名
  overallStyle: string  // 現在のカラースキーム説明
  blocks: BlockAnalysis[]
}

// ──────────────────────────────────────────────
//  Store State
// ──────────────────────────────────────────────

export interface PaintDemoState {
  uploadedFile: File | null
  uploadedImageUrl: string | null
  userNote: string
  isAnalyzing: boolean
  analysis: GunplaAnalysis | null
  error: string | null

  setUploadedFile: (file: File | null) => void
  setUserNote: (note: string) => void
  setError: (error: string | null) => void
  analyze: () => Promise<void>
  reset: () => void
}

// ──────────────────────────────────────────────
//  API Mode
// ──────────────────────────────────────────────

export enum ApiMode {
  FREE = 'FREE',
  PAID = 'PAID',
}

// ──────────────────────────────────────────────
//  Generation Result
// ──────────────────────────────────────────────

export interface GenerationResult {
  id: string
  inputImageUrl: string
  outputImageUrl: string
  prompt: string
  mode: ApiMode
  createdAt: Date
}

// ──────────────────────────────────────────────
//  Zustand Store State
// ──────────────────────────────────────────────

export interface PaintDemoState {
  // ── state ──────────────────────────────────
  apiMode: ApiMode
  uploadedFile: File | null
  uploadedImageUrl: string | null
  prompt: string
  isGenerating: boolean
  generationResult: GenerationResult | null
  error: string | null

  // ── actions ────────────────────────────────
  setApiMode: (mode: ApiMode) => void
  setUploadedFile: (file: File | null) => void
  setPrompt: (prompt: string) => void
  setError: (error: string | null) => void
  generate: () => Promise<void>
  reset: () => void
}

// ──────────────────────────────────────────────
//  Gemini API helpers
// ──────────────────────────────────────────────

export interface GeminiRequestPayload {
  imageBase64: string
  mimeType: string
  prompt: string
  apiKey: string
}

export interface GeminiResponse {
  outputImageBase64: string
  mimeType: string
}

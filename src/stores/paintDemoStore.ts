import { create } from 'zustand'
import { ApiMode, GenerationResult, PaintDemoState } from '@/types'
import { generatePaintImage } from '@/lib/geminiClient'

const defaultMode = (import.meta.env.VITE_DEFAULT_API_MODE as ApiMode) ?? ApiMode.FREE

export const usePaintDemoStore = create<PaintDemoState>((set, get) => ({
  // ── initial state ───────────────────────────
  apiMode: defaultMode,
  uploadedFile: null,
  uploadedImageUrl: null,
  prompt: '',
  isGenerating: false,
  generationResult: null,
  error: null,

  // ── actions ─────────────────────────────────
  setApiMode: (mode) => set({ apiMode: mode }),

  setUploadedFile: (file) => {
    const { uploadedImageUrl, generationResult } = get()
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl)
    if (generationResult?.outputImageUrl) URL.revokeObjectURL(generationResult.outputImageUrl)

    if (!file) {
      set({ uploadedFile: null, uploadedImageUrl: null, generationResult: null, error: null })
      return
    }
    const url = URL.createObjectURL(file)
    set({ uploadedFile: file, uploadedImageUrl: url, generationResult: null, error: null })
  },

  setPrompt: (prompt) => set({ prompt }),

  setError: (error) => set({ error }),

  generate: async () => {
    const { uploadedFile, prompt, apiMode } = get()

    if (!uploadedFile) {
      set({ error: 'Please upload an image first.' })
      return
    }
    if (!prompt.trim()) {
      set({ error: 'Please enter a paint instruction.' })
      return
    }

    const prevResult = get().generationResult
    if (prevResult?.outputImageUrl) URL.revokeObjectURL(prevResult.outputImageUrl)

    set({ isGenerating: true, error: null, generationResult: null })

    const result = await generatePaintImage(uploadedFile, prompt.trim(), apiMode)

    if (result.error) {
      set({ isGenerating: false, error: result.message })
      return
    }

    const generationResult: GenerationResult = {
      id: crypto.randomUUID(),
      inputImageUrl: get().uploadedImageUrl!,
      outputImageUrl: result.outputImageUrl,
      prompt: prompt.trim(),
      mode: apiMode,
      createdAt: new Date(),
    }

    set({ isGenerating: false, generationResult })
  },

  reset: () => {
    const { uploadedImageUrl, generationResult } = get()
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl)
    if (generationResult?.outputImageUrl) URL.revokeObjectURL(generationResult.outputImageUrl)

    set({
      uploadedFile: null,
      uploadedImageUrl: null,
      prompt: '',
      isGenerating: false,
      generationResult: null,
      error: null,
    })
  },
}))

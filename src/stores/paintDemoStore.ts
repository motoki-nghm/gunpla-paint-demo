import { create } from 'zustand'
import { GunplaAnalysis, PaintDemoState } from '@/types'
import { analyzeGunpla } from '@/lib/geminiAnalyzer'

export const usePaintDemoStore = create<PaintDemoState>((set, get) => ({
  uploadedFile: null,
  uploadedImageUrl: null,
  userNote: '',
  isAnalyzing: false,
  analysis: null,
  error: null,

  setUploadedFile: (file) => {
    const { uploadedImageUrl } = get()
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl)

    if (!file) {
      set({ uploadedFile: null, uploadedImageUrl: null, analysis: null, error: null })
      return
    }
    const url = URL.createObjectURL(file)
    set({ uploadedFile: file, uploadedImageUrl: url, analysis: null, error: null })
  },

  setUserNote: (userNote) => set({ userNote }),

  setError: (error) => set({ error }),

  analyze: async () => {
    const { uploadedFile, userNote } = get()
    if (!uploadedFile) {
      set({ error: '画像をアップロードしてください。' })
      return
    }

    set({ isAnalyzing: true, error: null, analysis: null })

    const result = await analyzeGunpla(uploadedFile, userNote)

    if (result.error) {
      set({ isAnalyzing: false, error: result.message })
      return
    }

    set({ isAnalyzing: false, analysis: result.analysis })
  },

  reset: () => {
    const { uploadedImageUrl } = get()
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl)
    set({
      uploadedFile: null,
      uploadedImageUrl: null,
      userNote: '',
      isAnalyzing: false,
      analysis: null,
      error: null,
    })
  },
}))

// 型エクスポート (他コンポーネントから利用)
export type { GunplaAnalysis }

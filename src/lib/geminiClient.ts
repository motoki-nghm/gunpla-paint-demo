import { ApiMode } from '@/types'

const GEMINI_MODEL = 'gemini-2.5-flash-preview-image-generation'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

// FREE mode: Google AI Studio limit is 2 req/min
const FREE_RATE_LIMIT_RPM = 2

// ──────────────────────────────────────────────
//  Result types
// ──────────────────────────────────────────────

export interface GeminiError {
  error: true
  code: string
  message: string
}

export interface GeminiSuccess {
  error: false
  outputImageUrl: string
  mimeType: string
}

export type GeminiResult = GeminiSuccess | GeminiError

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function resolveApiKey(mode: ApiMode): string {
  const key =
    mode === ApiMode.FREE
      ? import.meta.env.VITE_GEMINI_API_KEY_FREE
      : import.meta.env.VITE_GEMINI_API_KEY_PAID
  if (!key) throw new Error(`API key not set for mode ${mode}. Check your .env file.`)
  return key
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const commaIdx = result.indexOf(',')
      const header = result.slice(0, commaIdx)
      const base64 = result.slice(commaIdx + 1)
      const mimeType = header.split(':')[1].split(';')[0]
      resolve({ base64, mimeType })
    }
    reader.onerror = () => reject(new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

function base64ToObjectUrl(base64: string, mimeType: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }))
}

// ──────────────────────────────────────────────
//  Public API
// ──────────────────────────────────────────────

export async function generatePaintImage(
  imageFile: File,
  prompt: string,
  mode: ApiMode,
): Promise<GeminiResult> {
  if (mode === ApiMode.FREE) {
    console.warn(
      `[GeminiClient] FREE mode active — rate limit is ${FREE_RATE_LIMIT_RPM} req/min. ` +
        'Switch to PAID for higher throughput.',
    )
  }

  let apiKey: string
  try {
    apiKey = resolveApiKey(mode)
  } catch (err) {
    return {
      error: true,
      code: 'API_KEY_MISSING',
      message: err instanceof Error ? err.message : 'API key is not configured.',
    }
  }

  let base64: string
  let mimeType: string
  try {
    ;({ base64, mimeType } = await fileToBase64(imageFile))
  } catch {
    return { error: true, code: 'FILE_READ_ERROR', message: 'Failed to read the uploaded image.' }
  }

  // Prompt injection guard: keep user text in a separate part, never in system context
  const body = {
    contents: [
      {
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  }

  let response: Response
  try {
    response = await fetch(
      `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
  } catch {
    return {
      error: true,
      code: 'NETWORK_ERROR',
      message: 'Network request failed. Check your connection.',
    }
  }

  if (!response.ok) {
    let apiMessage = response.statusText
    try {
      const errBody = await response.json()
      apiMessage = errBody?.error?.message ?? apiMessage
    } catch {
      // leave statusText as fallback
    }
    return {
      error: true,
      code: `GEMINI_HTTP_${response.status}`,
      message: apiMessage,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any
  try {
    json = await response.json()
  } catch {
    return { error: true, code: 'PARSE_ERROR', message: 'Failed to parse Gemini response.' }
  }

  const parts: unknown[] = json?.candidates?.[0]?.content?.parts ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imagePart = parts.find((p: any) => p?.inlineData?.data) as any

  if (!imagePart) {
    return {
      error: true,
      code: 'NO_IMAGE_IN_RESPONSE',
      message: 'Gemini did not return an image. Try a different prompt.',
    }
  }

  const outputMimeType: string = imagePart.inlineData.mimeType ?? 'image/png'
  const outputImageUrl = base64ToObjectUrl(imagePart.inlineData.data, outputMimeType)

  return { error: false, outputImageUrl, mimeType: outputMimeType }
}

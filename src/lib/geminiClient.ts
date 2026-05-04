import { ApiMode } from '@/types'

const GEMINI_MODEL = 'gemini-2.0-flash-exp'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

// FREE mode: Google AI Studio limit is 2 req/min
const FREE_RATE_LIMIT_RPM = 2

const SYSTEM_PROMPT = `You are a professional Gunpla (Gundam plastic model) painting assistant.
The user will provide a photo of a Gunpla kit and a painting instruction in Japanese or English.

Your task:
- Edit the provided image to reflect the requested paint scheme
- Maintain the original kit's shape, proportions, and details
- Apply realistic model painting effects (metallic, pearl, candy coat, etc.) as instructed
- Output a single edited image

Important:
- This is an inspiration image for modeling reference, not a photorealistic render
- Do not add backgrounds or change composition
- Do not add text or watermarks to the image`

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

  // 3-part structure: system prompt → image → user instruction
  // Prompt injection guard: user text is always the last part, isolated from system context
  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: prompt },
        ],
      },
    ],
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
  // REST API returns snake_case: inline_data.mime_type / inline_data.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imagePart = parts.find((p: any) => p?.inline_data?.data ?? p?.inlineData?.data) as any

  if (!imagePart) {
    return {
      error: true,
      code: 'NO_IMAGE_IN_RESPONSE',
      message: 'Gemini did not return an image. Try a different prompt.',
    }
  }

  const inlineData = imagePart.inline_data ?? imagePart.inlineData
  const outputMimeType: string = inlineData.mime_type ?? inlineData.mimeType ?? 'image/png'
  const outputImageUrl = base64ToObjectUrl(inlineData.data, outputMimeType)

  return { error: false, outputImageUrl, mimeType: outputMimeType }
}

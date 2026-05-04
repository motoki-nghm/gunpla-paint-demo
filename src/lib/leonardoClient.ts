import { ApiMode } from '@/types'

const LEONARDO_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1'

// モデルID: 標準 = DreamShaper v7 / 高精度 = Leonardo Diffusion XL
const MODEL_ID: Record<ApiMode, string> = {
  [ApiMode.FREE]: 'ac614f96-1082-45bf-be9d-757f2d31c174',
  [ApiMode.PAID]: '1e60896f-3c26-4296-8ecc-53e2afecc132',
}

// init_strength: 元画像をどの程度維持するか (0=無視 / 1=完全維持)
// ガンプラ塗装: 形状を保ちながら色変更 → 0.35〜0.45 が最適
const INIT_STRENGTH: Record<ApiMode, number> = {
  [ApiMode.FREE]: 0.45,
  [ApiMode.PAID]: 0.38,
}

// ──────────────────────────────────────────────
//  Result types
// ──────────────────────────────────────────────

export interface LeonardoError {
  error: true
  code: string
  message: string
}

export interface LeonardoSuccess {
  error: false
  outputImageUrl: string
}

export type LeonardoResult = LeonardoSuccess | LeonardoError

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function resolveApiKey(): string {
  const key = import.meta.env.VITE_LEONARDO_API_KEY
  if (!key) throw new Error('VITE_LEONARDO_API_KEY が未設定です。.env を確認してください。')
  return key
}

async function uploadInitImage(file: File, apiKey: string): Promise<string> {
  const ext = file.type.split('/')[1] ?? 'jpeg'

  const initRes = await fetch(`${LEONARDO_BASE_URL}/init-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ extension: ext }),
  })

  if (!initRes.ok) {
    const body = await initRes.json().catch(() => ({}))
    throw new Error(body?.error ?? `画像アップロードの準備に失敗しました (HTTP ${initRes.status})`)
  }

  const { uploadInitImage: uploadData } = await initRes.json()
  const { id, url, fields } = uploadData

  // S3 presigned URL にアップロード
  const uploadForm = new FormData()
  const parsedFields: Record<string, string> = JSON.parse(fields)
  Object.entries(parsedFields).forEach(([k, v]) => uploadForm.append(k, v))
  uploadForm.append('file', file)

  const s3Res = await fetch(url as string, { method: 'POST', body: uploadForm })
  if (!s3Res.ok && s3Res.status !== 204) {
    throw new Error(`画像のアップロードに失敗しました (HTTP ${s3Res.status})`)
  }

  return id as string
}

async function createGeneration(
  initImageId: string,
  prompt: string,
  mode: ApiMode,
  apiKey: string,
): Promise<string> {
  const res = await fetch(`${LEONARDO_BASE_URL}/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      modelId: MODEL_ID[mode],
      num_images: 1,
      width: 512,
      height: 512,
      init_image_id: initImageId,
      init_strength: INIT_STRENGTH[mode],
      alchemy: false,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `生成リクエストに失敗しました (HTTP ${res.status})`)
  }

  const json = await res.json()
  const generationId = json?.sdGenerationJob?.generationId as string | undefined
  if (!generationId) throw new Error('生成IDの取得に失敗しました')
  return generationId
}

async function pollGeneration(generationId: string, apiKey: string): Promise<string> {
  const MAX_ATTEMPTS = 30
  const INTERVAL_MS = 2000

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await new Promise<void>((r) => setTimeout(r, INTERVAL_MS))

    const res = await fetch(`${LEONARDO_BASE_URL}/generations/${generationId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!res.ok) continue

    const json = await res.json()
    const gen = json?.generations_by_pk

    if (gen?.status === 'COMPLETE') {
      const imageUrl = gen?.generated_images?.[0]?.url as string | undefined
      if (!imageUrl) throw new Error('生成画像のURLが見つかりません')
      return imageUrl
    }

    if (gen?.status === 'FAILED') {
      throw new Error('画像生成が失敗しました。別のプロンプトをお試しください。')
    }
  }

  throw new Error('生成がタイムアウトしました。時間をおいて再試行してください。')
}

// ──────────────────────────────────────────────
//  Public API
// ──────────────────────────────────────────────

export async function generatePaintImage(
  imageFile: File,
  prompt: string,
  mode: ApiMode,
): Promise<LeonardoResult> {
  let apiKey: string
  try {
    apiKey = resolveApiKey()
  } catch (err) {
    return {
      error: true,
      code: 'API_KEY_MISSING',
      message: err instanceof Error ? err.message : 'APIキーが設定されていません。',
    }
  }

  let initImageId: string
  try {
    initImageId = await uploadInitImage(imageFile, apiKey)
  } catch (err) {
    return {
      error: true,
      code: 'UPLOAD_ERROR',
      message: err instanceof Error ? err.message : '画像のアップロードに失敗しました。',
    }
  }

  let generationId: string
  try {
    generationId = await createGeneration(initImageId, prompt, mode, apiKey)
  } catch (err) {
    return {
      error: true,
      code: 'GENERATION_ERROR',
      message: err instanceof Error ? err.message : '生成リクエストに失敗しました。',
    }
  }

  let outputImageUrl: string
  try {
    outputImageUrl = await pollGeneration(generationId, apiKey)
  } catch (err) {
    return {
      error: true,
      code: 'POLL_ERROR',
      message: err instanceof Error ? err.message : '生成結果の取得に失敗しました。',
    }
  }

  return { error: false, outputImageUrl }
}
